import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://leapai-15129-default-rtdb.firebaseio.com"
    });
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw new Error("Failed to initialize Firebase Admin SDK");
  }
}

const db = getFirestore();

interface User {
  id: string;
  email: string;
  age?: number;
  name?: string;
  displayName?: string;
  bio?: string;
  fears?: string[];
  motivationBlockers?: string[];
  adhd?: {
    diagnosed: boolean;
    notes?: string;
    copingStrategies?: string[];
  };
  personalityTraits?: string[];
  goals?: string[];
  preferredWorkingTimes?: string[];
  energyLevels?: {
    morning: 'low' | 'medium' | 'high';
    afternoon: 'low' | 'medium' | 'high';
    evening: 'low' | 'medium' | 'high';
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function handleUserRequest({ email }: { email: string }) {
  try {
    if (!OPENAI_API_KEY) {
      return "Sorry, the movie assistant is not configured properly. Please check the API key.";
    }

    const userDocRef = db.collection("users").doc(email);
    const userDoc = await userDocRef.get();
    
    let user: User;
    
    if (!userDoc.exists) {
      user = {
        id: email,
        email,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await userDocRef.set(user);
    } else {
      user = userDoc.data() as User;
    }

    const ageText = user.age ? `${user.age} years old` : "of unknown age";
    const prompt = `You are a friendly movie assistant. The user is ${ageText}. Suggest one suitable movie with a short description.`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful movie assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const movieSuggestion = data.choices[0].message.content;

    await userDocRef.update({
      updatedAt: new Date(),
      lastMovieRequest: new Date()
    });

    return movieSuggestion;

  } catch (error) {
    if (error instanceof Error) {
      return `Sorry, something went wrong: ${error.message}`;
    }
    return "Sorry, something went wrong while fetching your movie suggestion.";
  }
}

export async function updateUserAge({ email, age }: { email: string; age: number }) {
  try {
    const userDocRef = db.collection("users").doc(email);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      await userDocRef.update({
        age,
        updatedAt: new Date()
      });
    } else {
      await userDocRef.set({
        id: email,
        email,
        age,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function getUserProfile({ email }: { email: string }) {
  try {
    const userDocRef = db.collection("users").doc(email);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      return userDoc.data() as User;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

export async function updateUserProfile({ email, profileData }: {
  email: string;
  profileData: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>
}) {
  try {
    const userDocRef = db.collection("users").doc(email);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      await userDocRef.update({
        ...profileData,
        updatedAt: new Date()
      });
    } else {
      await userDocRef.set({
        id: email,
        email,
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}