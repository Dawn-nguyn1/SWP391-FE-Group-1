import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        const parsed = savedCart ? JSON.parse(savedCart) : [];
        // Migration: Ensure all items have a cartKey (use id as fallback for old data)
        return parsed.map(item => ({
            ...item,
            cartKey: item.cartKey || `${item.id}`
        }));
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prevCart => {
            // Unique key is just the product ID now
            const itemKey = `${product.id}`;
            const existingItem = prevCart.find(item => item.cartKey === itemKey);

            if (existingItem) {
                return prevCart.map(item =>
                    item.cartKey === itemKey ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            return [...prevCart, { ...product, cartKey: itemKey, quantity: 1 }];
        });
    };

    const removeFromCart = (cartKey) => {
        setCart(prevCart => prevCart.filter(item => item.cartKey !== cartKey));
    };

    const updateQuantity = (cartKey, quantity) => {
        if (quantity < 1) return;
        setCart(prevCart =>
            prevCart.map(item =>
                item.cartKey === cartKey ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => {
        const framePriceNum = parseInt(item.price.toString().replace(/[^\d]/g, ''));
        const itemTotal = framePriceNum * item.quantity;
        return total + itemTotal;
    }, 0);

    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
