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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const user: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || undefined,
                    photoURL: firebaseUser.photoURL || undefined,
                    emailVerified: firebaseUser.emailVerified,
                    createdAt: new Date(),
                };
                setCurrentUser(user);
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
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
} 