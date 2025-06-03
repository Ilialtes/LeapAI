"use client"; // Required for event handlers

import React, { useState } from 'react';
// import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// import { firebaseApp } from '@/lib/firebaseConfig'; // Adjust path as necessary

// const auth = getAuth(firebaseApp);

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    console.log("Attempting email sign in with:", email, password);
    // try {
    //   await signInWithEmailAndPassword(auth, email, password);
    //   console.log('User signed in successfully');
    //   // Redirect user or update UI
    // } catch (err: any) {
    //   setError(err.message);
    //   console.error('Error signing in:', err);
    // }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    console.log("Attempting Google sign in");
    // const provider = new GoogleAuthProvider();
    // try {
    //   await signInWithPopup(auth, provider);
    //   console.log('User signed in with Google successfully');
    //   // Redirect user or update UI
    // } catch (err: any) {
    //   setError(err.message);
    //   console.error('Error with Google sign in:', err);
    // }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h1>Sign In</h1>
      <form onSubmit={handleEmailSignIn}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email">Email:</label><br/>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', color: 'black' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password">Password:</label><br/>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', color: 'black' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: '10px', width: '100%', backgroundColor: 'blue', color: 'white' }}>
          {loading ? 'Signing In...' : 'Sign In with Email'}
        </button>
      </form>
      <hr style={{ margin: '20px 0' }} />
      <button onClick={handleGoogleSignIn} disabled={loading} style={{ padding: '10px', width: '100%', backgroundColor: 'red', color: 'white' }}>
        {loading ? 'Processing...' : 'Sign In with Google'}
      </button>
    </div>
  );
}
