"use client"; // Required for event handlers

import React, { useState } from 'react';
// import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
// import { firebaseApp } from '@/lib/firebaseConfig'; // Adjust path as necessary

// const auth = getAuth(firebaseApp);

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    console.log("Attempting email sign up with:", email);
    // try {
    //   await createUserWithEmailAndPassword(auth, email, password);
    //   console.log('User signed up successfully');
    //   // Redirect user or update UI (e.g., to profile page or dashboard)
    // } catch (err: any) {
    //   setError(err.message);
    //   console.error('Error signing up:', err);
    // }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleEmailSignUp}>
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
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="confirmPassword">Confirm Password:</label><br/>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', color: 'black' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: '10px', width: '100%', backgroundColor: 'green', color: 'white' }}>
          {loading ? 'Signing Up...' : 'Sign Up with Email'}
        </button>
      </form>
    </div>
  );
}
