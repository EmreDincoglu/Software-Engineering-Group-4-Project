import React, { createContext, useState, useContext} from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoggedin, setIsLoggedIn] = useState(false);

    return (
        <AuthContext.Provider value = {{ isLoggedin, setIsLoggedIn}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}
