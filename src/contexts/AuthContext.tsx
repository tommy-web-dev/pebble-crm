import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User as FirebaseUser,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Extended User interface to include Firebase auth properties
interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
    createdAt: Date;
}

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, displayName?: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    sendVerificationEmail: () => Promise<void>;
    updateUserProfile: (displayName: string) => Promise<void>;
    ensureUserDocument?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    async function signup(email: string, password: string, displayName?: string) {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName && result.user) {
            await updateProfile(result.user, { displayName });
        }

        // Send verification email
        if (result.user) {
            await sendEmailVerification(result.user);
        }

        // Ensure user document is created in Firestore
        if (result.user) {
            await ensureUserDocument(result.user);
        }
    }

    async function login(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    async function resetPassword(email: string) {
        return sendPasswordResetEmail(auth, email);
    }

    async function sendVerificationEmail() {
        if (auth.currentUser) {
            return sendEmailVerification(auth.currentUser);
        }
        throw new Error('No user logged in');
    }

    async function updateUserProfile(displayName: string) {
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName });
            // Update local state
            if (currentUser) {
                setCurrentUser({ ...currentUser, displayName });
            }
        }
    }

    // Function to create or update user document in Firestore
    async function ensureUserDocument(firebaseUser: FirebaseUser) {
        try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                // Create new user document
                const userData: any = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    subscription: null
                };

                // Only add fields that have values
                if (firebaseUser.displayName) {
                    userData.displayName = firebaseUser.displayName;
                }
                if (firebaseUser.photoURL) {
                    userData.photoURL = firebaseUser.photoURL;
                }

                await setDoc(userRef, userData);
                console.log('Created new user document for:', firebaseUser.email);
            } else {
                // Update existing user document with latest info
                const updateData: any = {
                    email: firebaseUser.email || '',
                    updatedAt: new Date()
                };

                // Only add fields that have values
                if (firebaseUser.displayName) {
                    updateData.displayName = firebaseUser.displayName;
                }
                if (firebaseUser.photoURL) {
                    updateData.photoURL = firebaseUser.photoURL;
                }

                await setDoc(userRef, updateData, { merge: true });
                console.log('Updated existing user document for:', firebaseUser.email);
            }
        } catch (error) {
            console.error('Error ensuring user document:', error);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const user: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    emailVerified: firebaseUser.emailVerified,
                    createdAt: new Date(),
                };

                // Only add optional fields if they have values
                if (firebaseUser.displayName) {
                    user.displayName = firebaseUser.displayName;
                }
                if (firebaseUser.photoURL) {
                    user.photoURL = firebaseUser.photoURL;
                }
                setCurrentUser(user);

                // Ensure user document exists in Firestore
                await ensureUserDocument(firebaseUser);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        sendVerificationEmail,
        updateUserProfile,
        ensureUserDocument: currentUser ? () => ensureUserDocument(auth.currentUser!) : undefined
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
} 