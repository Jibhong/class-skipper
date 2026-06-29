"use client";

import { useEffect } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { singletonFirebaseAuth } from "@/lib/client/singleton/client.firebaseAuth";

export async function logInToFirebase() {
  console.log("Attempting to log in to Firebase...");
  console.log("API Key loaded (first 5 chars):", process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 5));
  async function fetchToken() {
    const storedExpiry = localStorage.getItem("tokenExpiry");
    if (storedExpiry && parseInt(storedExpiry) > Date.now()) return;
    console.log("Token expired fetching new Firebase token...");
    const res = await fetch("/api/get-firebase-token");
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenExpiry", data.expiresAt);
    }
  }
  async function signInWithToken() {
    const token = localStorage.getItem("token");
    if (!token) return;
    console.log("signing in to firebase with token:", "**HIDDEN**");
    await signInWithCustomToken(singletonFirebaseAuth, token);
  }
  await fetchToken();
  await signInWithToken();
}

export default function FirebaseTokenFetcher() {
  useEffect(() => {
    // Run immediately on mount
    logInToFirebase();

    // Set up interval to run every 1 minute
    const intervalId = setInterval(() => {
      logInToFirebase();
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}