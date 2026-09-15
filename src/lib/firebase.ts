import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  serverTimestamp,
  getDocFromServer,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import type {
  InnovationBrief,
  PathwayStatus,
  SavedBriefDoc,
  UserBriefRecord,
} from "../types.ts";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (Critical requirement)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Error handling helper required by Firebase integration skill
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as instructed by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Authentication helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    console.error("Google sign in error:", err);
    throw err;
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err: unknown) {
    console.error("Sign out error:", err);
    throw err;
  }
}

// Save a brief into Firestore
export async function saveBrief(
  originalProblem: string,
  brief: InnovationBrief,
  currentUser: User | null
): Promise<string> {
  const briefRef = doc(collection(db, "briefs"));
  const briefId = briefRef.id;

  const briefPayload = {
    originalProblem,
    brief,
    userId: currentUser ? currentUser.uid : null,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(briefRef, briefPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `briefs/${briefId}`);
  }

  // If user is authenticated, also save reference in their user account
  if (currentUser) {
    const defaultStatuses: Record<string, PathwayStatus> = {};
    brief.pathways.forEach((_, idx) => {
      defaultStatuses[idx.toString()] = "Interested";
    });

    const userBriefRef = doc(db, "users", currentUser.uid, "userBriefs", briefId);
    try {
      await setDoc(userBriefRef, {
        briefId,
        originalProblem,
        brief,
        createdAt: serverTimestamp(),
        pathwayStatuses: defaultStatuses,
      });
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.CREATE,
        `users/${currentUser.uid}/userBriefs/${briefId}`
      );
    }
  }

  return briefId;
}

// Fetch a single brief by ID
export async function getBriefById(
  briefId: string
): Promise<SavedBriefDoc | null> {
  const briefRef = doc(db, "briefs", briefId);
  try {
    const snap = await getDoc(briefRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data() as SavedBriefDoc;
    return data;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `briefs/${briefId}`);
    return null;
  }
}

// Fetch all briefs for a user
export async function getUserBriefs(userId: string): Promise<UserBriefRecord[]> {
  const userBriefsCol = collection(db, "users", userId, "userBriefs");
  try {
    const snap = await getDocs(userBriefsCol);
    const records: UserBriefRecord[] = [];
    snap.forEach((d) => {
      records.push(d.data() as UserBriefRecord);
    });

    // Sort newest first
    records.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
      return timeB - timeA;
    });

    return records;
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.LIST,
      `users/${userId}/userBriefs`
    );
    return [];
  }
}

// Update status of a single pathway in user's brief
export async function updateUserPathwayStatus(
  userId: string,
  briefId: string,
  updatedStatuses: Record<string, PathwayStatus>
): Promise<void> {
  const userBriefRef = doc(db, "users", userId, "userBriefs", briefId);
  try {
    await updateDoc(userBriefRef, {
      pathwayStatuses: updatedStatuses,
    });
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.UPDATE,
      `users/${userId}/userBriefs/${briefId}`
    );
  }
}
