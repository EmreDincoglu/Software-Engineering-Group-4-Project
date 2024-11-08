import React, { createContext, useState, useContext} from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoggedin, setIsLogginIn] = useState(false);

    return (
        <AuthContext.Provider value = {{ isLoggedin, setIsLogginIn}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}
