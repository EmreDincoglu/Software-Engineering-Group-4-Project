import React, { createContext, useState, useContext} from 'react';
const AuthContext = createContext();

export function AuthProvider({children}) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authUser, setAuthUser] = useState(null);
    const [isProfileComplete, setIsProfileComplete] = useState(false);

    const value = {
        authUser,
        setAuthUser,
        isLoggedIn,
        setIsLoggedIn,
        isProfileComplete,
        setIsProfileComplete
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
