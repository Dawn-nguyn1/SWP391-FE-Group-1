import React from "react";
import { createContext, useState } from "react";

export const AuthContext = createContext({});

export const AuthWrapper = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({
        // _id: "",
        // accessKey: "",
        // email: "",
        // profile: {
        //     fullName: ""
        // },
        // role: "",
        _id: "",
        accessKey: "",
        refreshKey: "",
        role: "",

    });

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
            {props.children}
        </AuthContext.Provider>
    );
}

