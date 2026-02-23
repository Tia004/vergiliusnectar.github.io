import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return unsubscribe;
    }, []);

    const loginEmail = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const registerEmail = (email, password, displayName) =>
        createUserWithEmailAndPassword(auth, email, password).then((cred) => {
            if (displayName) {
                return updateProfile(cred.user, { displayName });
            }
        });

    const loginGoogle = () => signInWithPopup(auth, googleProvider);

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, authLoading, loginEmail, registerEmail, loginGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
