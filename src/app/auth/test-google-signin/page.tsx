"use client";

import React, { useState, useEffect } from 'react';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser // Alias to avoid conflict with your User interface if any
} from 'firebase/auth';
import { firebaseApp } from '@/lib/firebaseConfig'; // Adjust path as necessary

const auth = getAuth(firebaseApp);

export default function TestGoogleSignInPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      setCurrentUser(result.user);
      console.log('User signed in with Google successfully:', result.user);
    } catch (err: any) {
      setError(err.message);
      console.error('Error with Google sign in:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      setLoading(true);
      await signOut(auth);
      setCurrentUser(null);
      console.log('User signed out successfully');
    } catch (err: any) {
      setError(err.message);
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Google Sign-In</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {currentUser ? (
        <div>
          <h2>Welcome, {currentUser.displayName || 'User'}!</h2>
          <p>Email: {currentUser.email}</p>
          <p>UID: {currentUser.uid}</p>
          {currentUser.photoURL && (
            <img
              src={currentUser.photoURL}
              alt="User profile"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          )}
          <br />
          <button
            onClick={handleSignOut}
            style={{ padding: '10px 20px', marginTop: '20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p>You are not signed in.</p>
          <button
            onClick={handleGoogleSignIn}
            style={{ padding: '10px 20px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}
