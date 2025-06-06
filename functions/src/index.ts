import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
// If using v2 functions, you might import specific trigger types:
// import { onCall, HttpsOptions } from "firebase-functions/v2/https";
// For Gemini API:
// import { VertexAI } from "@google-cloud/vertexai"; // Alternative
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

admin.initializeApp();

// Define data types (can also be imported from a shared types directory if set up)
// For simplicity, defining them here if not already easily importable from ../../src/types
interface DailyCheckinData {
  goalId: string;
  mood: 'great' | 'good' | 'okay' | 'bad';
  notes?: string;
  // userId will be from context.auth.uid
}

interface GoalData {
  lastCheckinDate?: admin.firestore.Timestamp;
  progress?: number;
}

interface AICoachingRequestData {
  checkinId: string;
  userPrompt?: string;
}

// --- submitDailyCheckin Function ---
export const submitDailyCheckin = functions.https.onCall(async (data: DailyCheckinData, context) => {
  // 1. Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const { goalId, mood, notes } = data;
  const userId = context.auth.uid;

  if (!goalId || !mood) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: goalId and mood.",
    );
  }

  try {
    const firestore = admin.firestore();
    const timestamp = admin.firestore.Timestamp.now();

    // 2. Create DailyCheckin document
    const checkinRef = firestore.collection("dailyCheckins").doc();
    await checkinRef.set({
      checkinId: checkinRef.id,
      userId,
      goalId,
      date: timestamp, // date of checkin
      mood,
      notes: notes || null,
      aiGeneratedFeedback: null, // To be filled by AI coach later if applicable
      createdAt: timestamp, // record creation time
    });

    // 3. Update Goal document
    const goalRef = firestore.collection("goals").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists || goalDoc.data()?.userId !== userId) {
      throw new functions.https.HttpsError(
        "not-found",
        "Goal not found or user does not have access.",
      );
    }

    const updateData: GoalData = {
      lastCheckinDate: timestamp,
      // Optionally, update progress here based on some logic
      // progress: admin.firestore.FieldValue.increment(5) // Example: increment progress
    };
    await goalRef.update(updateData);

    functions.logger.info(`Daily check-in ${checkinRef.id} submitted for goal ${goalId} by user ${userId}`);
    return { success: true, checkinId: checkinRef.id, message: "Check-in submitted successfully." };

  } catch (error) {
    functions.logger.error("Error submitting daily check-in:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred.",
      error,
    );
  }
});

// --- getAICoachingResponse Function ---
export const getAICoachingResponse = functions.https.onCall(async (data: AICoachingRequestData, context) => {
  // 1. Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const { checkinId, userPrompt } = data;
  const userId = context.auth.uid;

  if (!checkinId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required field: checkinId.",
    );
  }

  // Securely access API Key
  // Option 1: Firebase runtime configuration (recommended for Firebase Functions)
  // Set using Firebase CLI: firebase functions:config:set leap_ai.gemini_key="YOUR_GEMINI_API_KEY"
  let geminiApiKey: string | undefined;
  try {
    geminiApiKey = functions.config().leap_ai?.gemini_key;
  } catch (error) {
    functions.logger.warn("Could not read leap_ai.gemini_key from functions.config(). Ensure it's set.");
  }

  if (!geminiApiKey) {
    // Option 2: Environment variable (less common for callable functions, more for HTTP)
    // geminiApiKey = process.env.GEMINI_API_KEY; // Ensure this is set in your Cloud Functions environment

    // If still no key, log an error and exit.
    // In a real app, you might return a specific error or have a fallback.
    functions.logger.error("GEMINI_API_KEY is not configured. Please set leap_ai.gemini_key in Firebase functions config.");
    throw new functions.https.HttpsError(
        "internal",
        "AI Service is not configured.",
    );
  }

  try {
    const firestore = admin.firestore();

    // 2. Fetch DailyCheckin document and associated Goal
    const checkinRef = firestore.collection("dailyCheckins").doc(checkinId);
    const checkinDoc = await checkinRef.get();

    if (!checkinDoc.exists || checkinDoc.data()?.userId !== userId) {
      throw new functions.https.HttpsError(
        "not-found",
        "Daily check-in not found or user does not have access.",
      );
    }
    const checkinData = checkinDoc.data();
    const goalId = checkinData?.goalId;

    const goalRef = firestore.collection("goals").doc(goalId);
    const goalDoc = await goalRef.get();
    if (!goalDoc.exists) { // Assuming userId check was implicitly done by checkin's userId
        throw new functions.https.HttpsError("not-found", "Associated goal not found.");
    }
    const goalData = goalDoc.data();

    // 3. Initialize Google AI Gemini SDK
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Or your preferred model

    // 4. Prepare prompt for Gemini
    // This is a placeholder. You'll want to build a more sophisticated prompt.
    let prompt = \`This is a daily check-in for the goal: "${goalData?.title}".
    User's mood: ${checkinData?.mood}.
    User's notes: "${checkinData?.notes || 'No notes provided.'}"\`;

    if (userPrompt) {
        prompt += \`
User's specific question/request: "${userPrompt}"\`;
    }

    prompt += "
Provide some encouraging and actionable feedback based on this check-in, keeping the user's goal in mind. Be concise and positive.";

    functions.logger.info("Generated prompt for Gemini:", prompt);

    // 5. Call Gemini API
    const generationConfig = {
      // temperature: 0.9, // Example configuration
      // topK: 1,
      // topP: 1,
      maxOutputTokens: 256,
    };
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    // For text-only input
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{text: prompt}] }],
        generationConfig,
        safetySettings,
    });

    let aiResponseText = "No response from AI.";
    if (result.response) {
      aiResponseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "Could not extract AI response.";
    } else {
      functions.logger.error("Gemini API call failed or returned an empty response:", result);
      throw new functions.https.HttpsError("internal", "Failed to get response from AI service.");
    }

    functions.logger.info("Received AI response:", aiResponseText);

    // 6. Save AI response to DailyCheckin document
    await checkinRef.update({
      aiGeneratedFeedback: aiResponseText,
    });

    // 7. Return AI response
    return { success: true, aiResponse: aiResponseText };

  } catch (error) {
    functions.logger.error("Error getting AI coaching response:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    // It's good to avoid leaking raw error details from external services like Gemini to the client.
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while fetching AI feedback.",
    );
  }
});
