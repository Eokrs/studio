
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/data/products';
import type { CartItem } from '@/types/cart';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, quantity: number) => void;
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
  const { toast } = useToast();

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
    if (cartItems.length >= 0) { // Also save when cart becomes empty
        try {
            const serializedCart = JSON.stringify(cartItems);
            localStorage.setItem('nuvyraCart', serializedCart);
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Product, size: string, quantity: number) => {
    const itemId = `${product.id}-${size}`;
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === itemId);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { id: itemId, product, quantity, size }];
    });

    toast({
      title: "Produto Adicionado!",
      description: `${product.name} (Tam: ${size}) x${quantity} foi adicionado ao seu carrinho.`,
    });
  }, [toast]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        const itemToRemove = prevItems.find(item => item.id === itemId);
        if (itemToRemove) {
          toast({
            title: "Produto Removido",
            description: `${itemToRemove.product.name} (Tam: ${itemToRemove.size}) foi removido do carrinho.`,
            variant: "destructive",
          });
        }
        return prevItems.filter(item => item.id !== itemId);
      }
      return prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      );
    });
  }, [toast]);

  const removeFromCart = useCallback((itemId: string) => {
    updateQuantity(itemId, 0); 
  }, [updateQuantity]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({
      title: "Carrinho Esvaziado",
      description: "Todos os itens foram removidos do seu carrinho.",
      variant: "default",
    });
  }, [toast]);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = cartItems.reduce((total, item) => {
    const itemPrice = (item.product.price || 0);
    return total + (itemPrice * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
