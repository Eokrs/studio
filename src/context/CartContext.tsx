
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/data/products';
import type { CartItem } from '@/types/cart';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string) => void;
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
    if (cartItems.length > 0) {
        localStorage.setItem('nuvyraCart', JSON.stringify(cartItems));
    } else if (localStorage.getItem('nuvyraCart')) { 
        localStorage.removeItem('nuvyraCart');
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Product, size: string) => {
    const itemId = `${product.id}-${size}`;
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === itemId);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { id: itemId, product, quantity: 1, size }];
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return prevItems;

      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== itemId);
      }
      return prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
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
    const price = typeof item.product.price === 'number' ? item.product.price : 0;
    const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 0;
    return total + (price * quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
