import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCartAPI } from '../services/api.service';
import { AuthContext } from './auth.context';
import { normalizeCart } from '../utils/role-data';

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
            const normalizedCart = normalizeCart(res);
            setCart(normalizedCart);
            setCartCount(normalizedCart.items.reduce((sum, item) => sum + item.quantity, 0));
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
