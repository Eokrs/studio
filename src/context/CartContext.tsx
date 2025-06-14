
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/data/products';
import type { CartItem } from '@/types/cart';
import { useToast } from '@/hooks/use-toast';


interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
      localStorage.removeItem('nuvyraCart'); // Clear corrupted data
    }
  }, []);

  useEffect(() => {
    // Only save if cart has items or if it was populated and now is empty (to clear it)
    if (cartItems.length > 0) {
        localStorage.setItem('nuvyraCart', JSON.stringify(cartItems));
    } else if (localStorage.getItem('nuvyraCart')) { // If cart became empty, remove from storage
        localStorage.removeItem('nuvyraCart');
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
    toast({
      title: "Produto Adicionado!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
      variant: "default",
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    let itemWasActuallyRemoved = false;
    let removedItemName: string | undefined;

    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex(item => item.product.id === productId);

      if (itemIndex === -1) return prevItems; // Item not found, no change

      if (quantity <= 0) {
        removedItemName = prevItems[itemIndex].product.name;
        itemWasActuallyRemoved = true;
        return prevItems.filter(item => item.product.id !== productId);
      }
      return prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
    });

    if (itemWasActuallyRemoved && removedItemName) {
      toast({
        title: "Produto Removido!",
        description: `${removedItemName} foi removido do carrinho.`,
        variant: "destructive",
      });
    }
  }, [toast, setCartItems]);

  const removeFromCart = useCallback((productId: string) => {
    updateQuantity(productId, 0);
  }, [updateQuantity]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    // localStorage.removeItem('nuvyraCart'); // Handled by useEffect on cartItems change
    toast({
        title: "Carrinho Esvaziado",
        description: "Todos os itens foram removidos do carrinho.",
        variant: "default",
    });
  }, [toast]);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = 0; // Price calculation not implemented as per original scope

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
