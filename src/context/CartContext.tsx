
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/data/products';
import type { CartItem, Addon } from '@/types/cart';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, quantity: number, addons: Addon[]) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('nuvyraCart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      localStorage.removeItem('nuvyraCart');
    }
  }, []);

  useEffect(() => {
    try {
      const serializedCart = JSON.stringify(cartItems);
      localStorage.setItem('nuvyraCart', serializedCart);
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Product, size: string, quantity: number, addons: Addon[]) => {
    const sortedAddons = [...addons].sort((a, b) => a.name.localeCompare(b.name));
    const addonsId = JSON.stringify(sortedAddons.map(a => a.name));
    const itemId = `${product.id}-${size}-${addonsId}`;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === itemId);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { id: itemId, product, quantity, size, addons: sortedAddons }];
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== itemId);
      }
      return prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    updateQuantity(itemId, 0);
  }, [updateQuantity]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = cartItems.reduce((total, item) => {
    const basePrice = item.product.price || 0;
    const addonsPrice = item.addons.reduce((addonTotal, addon) => addonTotal + addon.price, 0);
    const itemTotal = (basePrice + addonsPrice) * item.quantity;
    return total + itemTotal;
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
