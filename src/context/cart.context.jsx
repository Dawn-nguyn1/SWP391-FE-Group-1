import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCartAPI } from '../services/api.service';
import { AuthContext } from './auth.context';

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext({});

export const CartWrapper = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const [cart, setCart] = useState(null);
    const { user } = useContext(AuthContext);

    const fetchCart = useCallback(async () => {
        if (!user?.accessKey) { setCartCount(0); setCart(null); return; }
        try {
            const res = await getCartAPI();
            if (res?.items) {
                setCart(res);
                setCartCount(res.items.reduce((sum, i) => sum + i.quantity, 0));
            }
        } catch { setCartCount(0); }
    }, [user?.accessKey]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchCart(); }, [fetchCart]);

    return (
        <CartContext.Provider value={{ cart, setCart, cartCount, setCartCount, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};
