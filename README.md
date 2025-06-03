# Leap AI

**Leap AI is an AI Accountability Coach web app designed to help users stay emotionally connected to their goals. It features daily check-ins, personalized encouragement, and AI-powered guidance (via Google Gemini) to keep users on track.**

## Technology Stack

*   **Frontend:** React with Next.js (TypeScript, App Router, Tailwind CSS)
*   **Backend:** Firebase Cloud Functions (Node.js with TypeScript)
*   **Database:** Cloud Firestore
*   **Authentication:** Firebase Authentication (Email/Password, Google Sign-In)
*   **AI Integration:** Google Gemini API (via Cloud Functions using `@google/generative-ai`)
*   **State Management (Frontend):** React Context API (example in `src/context/AuthContext.tsx`)
*   **Linting:** ESLint

## Prerequisites

*   Node.js (Recommended: >=18.x.x)
*   npm (comes with Node.js) or yarn
*   Firebase CLI (`npm install -g firebase-tools` or `yarn global add firebase-tools`)

## Firebase Project Setup Instructions

1.  Go to the Firebase console (console.firebase.google.com) and create a new project (or use an existing one).
2.  Add a **Web app** to your Firebase project.
    *   Give it a nickname (e.g., "Leap AI Web").
    *   Register the app. You **do not** need to add the Firebase SDK snippets at this stage if you are manually setting it up as below.
3.  Copy the Firebase configuration object provided by Firebase after registering your web app. It looks like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID" // Optional
    };
    ```
4.  In the frontend codebase, open the file `src/lib/firebaseConfig.ts`.
    *   Replace the placeholder `firebaseConfig` object with the one you copied from the Firebase console.
    *   Uncomment lines for Firebase services (Auth, Firestore, Functions) as you start using them.
    ```typescript
    import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
    // import { getAuth } from "firebase/auth"; // Uncomment when setting up auth
    // import { getFirestore } from "firebase/firestore"; // Uncomment for Firestore
    // import { getFunctions } from "firebase/functions"; // Uncomment for Cloud Functions
    // import { connectAuthEmulator } from "firebase/auth"; // For emulators
    // import { connectFirestoreEmulator } from "firebase/firestore"; // For emulators
    // import { connectFunctionsEmulator } from "firebase/functions"; // For emulators


    // Paste your actual Firebase config object here:
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    let app: FirebaseApp;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    export const firebaseApp = app;
    // export const auth = getAuth(app);
    // export const db = getFirestore(app);
    // export const functions = getFunctions(app);

    // Example for connecting to Firebase Emulators during development
    // Make sure to only run this in a development environment
    // if (process.env.NODE_ENV === 'development') {
    //   try {
    //     console.log("Connecting to Firebase Emulators...");
    //     const authInstance = getAuth(app);
    //     connectAuthEmulator(authInstance, "http://localhost:9099");
    //
    //     const dbInstance = getFirestore(app);
    //     connectFirestoreEmulator(dbInstance, "localhost", 8080);
    //
    //     const functionsInstance = getFunctions(app);
    //     connectFunctionsEmulator(functionsInstance, "localhost", 5001);
    //     console.log("Successfully connected to emulators.");
    //   } catch (error) {
    //     console.error("Error connecting to Firebase emulators:", error);
    //   }
    // }
    ```
5.  **Enable Authentication Methods:**
    *   In the Firebase console, navigate to **Authentication** (under Build).
    *   Go to the **Sign-in method** tab.
    *   Enable **Email/Password** and **Google** providers. For Google, you might need to provide a project support email.
6.  **Set up Cloud Firestore:**
    *   In the Firebase console, navigate to **Cloud Firestore** (under Build).
    *   Click **Create database**.
    *   Start in **test mode** for initial development. This allows open access. **Remember to secure your database with security rules before production.**
    *   Choose a Firestore location (e.g., `us-central`). This cannot be changed later.
7.  **Deploy Firestore Security Rules:**
    *   Ensure you are logged into the Firebase CLI: `firebase login`.
    *   From the root of your project directory, deploy the rules:
        ```bash
        firebase deploy --only firestore:rules
        ```
    *   The rules are defined in `firestore.rules` in your project.

## Environment Variables for Cloud Functions (Local & Deployed)

For the `getAICoachingResponse` Cloud Function to use the Google Gemini API, you need to provide an API key.

*   **Local Development with Firebase Emulators:**
    1.  Create a file named `.env.local` inside the `functions` directory (i.e., `functions/.env.local`). This file is gitignored.
    2.  Add your Gemini API key to this file:
        ```env
        GEMINI_API_KEY=your_gemini_api_key_here
        ```
    3.  The `getAICoachingResponse` function stub in `functions/src/index.ts` attempts to load this via `process.env.GEMINI_API_KEY` when `functions.config().leap_ai.gemini_key` is not available. *(Self-correction: The provided function stub prioritizes `functions.config()`. For local testing where `functions.config()` might not be populated by emulators for custom vars without extra steps, directly using `process.env` after loading with `dotenv` is common. The stub has been updated to reflect primary use of `functions.config()` as per issue, but local setup via `.env.local` for `process.env` is a good alternative if `functions.config()` is tricky with emulators).*
    *Alternatively, for a more robust local setup that mirrors deployed config:*
     You can set runtime configuration for emulators by creating/editing `functions/.runtimeconfig.json` (this file should also be gitignored):
      ```json
      {
        "leap_ai": {
          "gemini_key": "your_gemini_api_key_here_for_emulator"
        }
      }
      ```
      Then run emulators with `firebase emulators:start --import=./firebase-emulator-data --export-on-exit` (the import path is optional).

*   **Deployed Functions:**
    Set runtime configuration variables for your Firebase project using the Firebase CLI:
    ```bash
    firebase functions:config:set leap_ai.gemini_key="your_actual_gemini_api_key_for_deployment"
    ```
    *   You can view current config with `firebase functions:config:get`.
    *   The function `getAICoachingResponse` in `functions/src/index.ts` is already set up to access this key via `functions.config().leap_ai.gemini_key`.
    *   **Alternative for sensitive keys:** Use Google Cloud Secret Manager integration with Cloud Functions. Set the secret in Secret Manager, grant the function's service account access, and then access it in your function code. This is more secure for highly sensitive keys.

## Local Development Setup

1.  **Clone & Install Root Dependencies:**
    ```bash
    # git clone <repository_url> # If you haven't already
    # cd leap-ai
    npm install
    ```
    or if using yarn:
    ```bash
    # yarn install
    ```
2.  **Install Functions Dependencies:**
    ```bash
    cd functions
    npm install
    cd ..
    ```
    or if using yarn:
    ```bash
    # cd functions
    # yarn install
    # cd ..
    ```
3.  **Set up Environment Variables:**
    *   Copy your Firebase web app config into `src/lib/firebaseConfig.ts` as described in "Firebase Project Setup Instructions".
    *   For AI functions, set up your `GEMINI_API_KEY` for local development as described in "Environment Variables for Cloud Functions".
4.  **Run Next.js Frontend:**
    Open a terminal and run:
    ```bash
    npm run dev
    ```
    or
    ```bash
    # yarn dev
    ```
    The application will typically be available at `http://localhost:3000`.
5.  **Run Firebase Emulators:**
    Open a *separate* terminal and run:
    ```bash
    firebase emulators:start --import=./firebase-emulator-data --export-on-exit
    ```
    *   The `--import=./firebase-emulator-data` flag loads data from a previous session (if it exists).
    *   The `--export-on-exit` flag saves data when the emulators shut down.
    *   The emulators include Auth, Firestore, Functions, Pub/Sub, and Hosting. You can access the Emulator UI at `http://localhost:4000` (or as indicated in your terminal).
    *   Ensure your `firebaseConfig.ts` is set up to connect to emulators if `process.env.NODE_ENV === 'development'` (see commented out section in `src/lib/firebaseConfig.ts`).

## Deployment

Before deploying, ensure your `firebase.json` is configured correctly for hosting and functions. The current `firebase.json` includes a basic setup for Next.js SSR hosting by rewriting all requests to a Cloud Function named `nextServer`. This typically requires a specific function in your `functions/src/index.ts` to handle Next.js requests, or a different hosting setup if you are exporting a static Next.js site or using newer Next.js Firebase Hosting integrations (e.g., via framework-aware `firebase init hosting`).

**Consult the official Firebase documentation for the most up-to-date Next.js deployment strategies, as these can evolve.**

1.  **Deploy Frontend & Hosting Configuration:**
    This usually deploys what's in your `out` folder (for static export) or sets up the rewrite to your Next.js SSR Cloud Function.
    ```bash
    firebase deploy --only hosting
    ```
2.  **Deploy Backend Functions:**
    This deploys the functions in your `functions` directory.
    ```bash
    firebase deploy --only functions
    ```
3.  **Deploy All:**
    To deploy everything defined in your `firebase.json` (hosting, functions, firestore rules, etc.):
    ```bash
    firebase deploy
    ```

## Project Structure Overview

*   `README.md`: This file.
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
*   `firebase.json`: Configuration for Firebase CLI, defining how parts of the project (Firestore, Functions, Hosting) are deployed.
*   `firestore.rules`: Security rules for Cloud Firestore.
*   `firestore.indexes.json`: Firestore index definitions (currently empty).
*   `next.config.mjs`: Next.js configuration file.
*   `package.json`: npm dependencies and scripts for the Next.js frontend.
*   `postcss.config.js`: PostCSS configuration (used by Tailwind CSS).
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `tsconfig.json`: TypeScript configuration for the Next.js frontend.
*   `.firebaserc`: Firebase project configuration, often linking to a specific Firebase project.
*   `public/`: Static assets for the Next.js application (e.g., images, favicons).
*   `src/`: Source code for the Next.js application.
    *   `src/app/`: Next.js App Router pages and layouts.
        *   `layout.tsx`: Root layout for the application.
        *   `page.tsx`: Homepage/landing page.
        *   `dashboard/page.tsx`: User dashboard.
        *   `goals/[goalId]/page.tsx`: Viewing a specific goal.
        *   `goals/new/page.tsx`: Creating a new goal.
        *   `checkin/[goalId]/page.tsx`: Daily check-in for a goal.
        *   `profile/page.tsx`: User profile page.
        *   `auth/signin/page.tsx`: Sign-in page.
        *   `auth/signup/page.tsx`: Sign-up page.
    *   `src/components/`: Reusable React components.
        *   `ui/`: Common UI elements (e.g., buttons, inputs). Currently contains `.gitkeep`.
        *   `layout/Navbar.tsx`: Placeholder Navbar component.
    *   `src/context/`: React Context API providers (e.g., `AuthContext.tsx`).
    *   `src/lib/`: Utility files and library initializations (e.g., `firebaseConfig.ts`).
    *   `src/services/`: Modules for interacting with backend services.
        *   `goalService.ts`: Placeholder for Firestore interactions related to goals.
        *   `aiCoachService.ts`: Placeholder for interactions with AI coaching Cloud Functions.
    *   `src/types/index.ts`: TypeScript type definitions and interfaces (e.g., `User`, `Goal`, `DailyCheckin`).
    *   `src/app/globals.css`: Global styles for the application (includes Tailwind CSS base styles).
*   `functions/`: Firebase Cloud Functions.
    *   `src/index.ts`: Main file for Cloud Functions definitions.
    *   `package.json`: npm dependencies and scripts for Cloud Functions.
    *   `tsconfig.json`: TypeScript configuration for Cloud Functions.
    *   `.eslintrc.js`: ESLint configuration for Cloud Functions.
    *   `lib/`: Compiled JavaScript output from TypeScript (gitignored).
    *   `node_modules/`: Dependencies for Cloud Functions (gitignored).

---

This project structure provides a solid foundation for building Leap AI. Remember to replace placeholder API keys and configurations with your actual project details.
