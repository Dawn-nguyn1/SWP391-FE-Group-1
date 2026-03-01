import React, { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({});

const DEFAULT_USER = { id: "", accessKey: "", refreshKey: "", role: "" };

export const AuthWrapper = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(DEFAULT_USER);

    // Restore user from localStorage on first load
    useEffect(() => {
        try {
            const saved = localStorage.getItem('user_info');
            const token = localStorage.getItem('access_token');
            if (saved && token) {
                setUser(JSON.parse(saved));
            }
        } catch (_e) {
            localStorage.removeItem('user_info');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sync user state to localStorage whenever it changes
    const setUserAndPersist = (u) => {
        setUser(u);
        if (u && u.id) {
            localStorage.setItem('user_info', JSON.stringify(u));
        } else {
            localStorage.removeItem('user_info');
            localStorage.removeItem('access_token');
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser: setUserAndPersist, isLoading, setIsLoading }}>
            {props.children}
        </AuthContext.Provider>
    );
}
