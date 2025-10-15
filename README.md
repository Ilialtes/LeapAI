# SubtlePush - A Focus App That Works With Your Brain

SubtlePush is a compassionate partner that helps users overcome motivational hurdles with personalized AI coaching, automated tracking, and a shame-free environment. It's a full-stack web application designed for anyone who struggles with focus and procrastination.

**This project demonstrates a complete, end-to-end application development lifecycle, from a polished user experience to a cloud-native, serverless backend.**

<img width="2541" height="1316" alt="image" src="https://github.com/user-attachments/assets/57f1582d-0c27-4263-8fa2-3e9a3202ca6b" />

## 🚀 Key Features

* **The Frictionless Focus Room:** Start a focus session in a single click. A minimalist design removes distractions and helps build momentum, one 5-minute win at a time.
* **The AI Action Hub:** Feeling stuck? Our AI coach helps break down big goals into tiny, achievable steps and provides personalized "on-ramps" to get you into a state of flow.
* **Compassionate Gamification:** Earn badges for your effort, not perfection. Our achievement system is designed to be a delightful surprise that celebrates progress without creating pressure.

## 🛠️ Technology Stack

This project was built using a modern, scalable, and cloud-native tech stack:

* **Frontend:** **Next.js** with **React** (App Router, TypeScript, Tailwind CSS)
* **Backend:** **Firebase Cloud Functions** (Node.js with TypeScript)
* **Database:** **Cloud Firestore** (NoSQL)
* **Authentication:** **Firebase Authentication**
* **Cloud Platform:** **Google Cloud Platform (GCP)** via Firebase
* **AI Integration:** **Google Gemini API**

<details>
<summary>💻 **Developer Setup & Local Development Instructions**</summary>

### Prerequisites

* Node.js (Recommended: >=18.x.x)
* npm (comes with Node.js) or yarn
* Firebase CLI (`npm install -g firebase-tools` or `yarn global add firebase-tools`)

### Firebase Project Setup Instructions

1.  Go to the Firebase console (console.firebase.google.com) and create a new project.
2.  Add a **Web app** to your Firebase project.
3.  Copy the Firebase configuration object provided after registering your web app.
4.  In the frontend codebase, open `src/lib/firebaseConfig.ts` and replace the placeholder `firebaseConfig` object with your own.
5.  **Enable Authentication Methods:** In the Firebase console, go to **Authentication** > **Sign-in method** and enable **Email/Password** and **Google**.
6.  **Set up Cloud Firestore:** In the Firebase console, go to **Cloud Firestore**, create a database in **test mode**, and choose a location.
7.  **Deploy Firestore Security Rules:** From your project root, run `firebase deploy --only firestore:rules`. The rules are defined in `firestore.rules`.

### Environment Variables for Cloud Functions (Local & Deployed)

For the AI Cloud Function to use the Google Gemini API, you need to provide an API key.

* **Local Development with Emulators:**
    Create a file named `functions/.runtimeconfig.json` (this file should be gitignored) and add your key:
    ```json
    {
      "subtlepush": {
        "gemini_key": "your_gemini_api_key_for_emulator"
      }
    }
    ```

* **Deployed Functions:**
    Set the runtime configuration variable using the Firebase CLI:
    ```bash
    firebase functions:config:set subtlepush.gemini_key="your_actual_gemini_api_key_for_deployment"
    ```
    The function is already set up to access this key.

### Local Development Setup

1.  **Clone & Install Root Dependencies:**
    ```bash
    npm install
    ```

2.  **Install Functions Dependencies:**
    ```bash
    cd functions
    npm install
    cd ..
    ```

3.  **Set up Environment Variables:**
    * Add your Firebase web app config to `src/lib/firebaseConfig.ts`.
    * Set up your `GEMINI_API_KEY` for local development as described above.

4.  **Run Next.js Frontend (Terminal 1):**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

5.  **Run Firebase Emulators (Terminal 2):**
    ```bash
    firebase emulators:start
    ```
    The Emulator UI will be available at `http://localhost:4000`.

### Deployment

Before deploying, ensure your `firebase.json` is configured correctly for your Next.js SSR setup.

1.  **Deploy Frontend & Hosting:**
    ```bash
    firebase deploy --only hosting
    ```

2.  **Deploy Backend Functions:**
    ```bash
    firebase deploy --only functions
    ```

3.  **Deploy All:**
    ```bash
    firebase deploy
    ```

</details>
