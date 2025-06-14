
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/data/products';
import type { CartItem } from '@/types/cart';
import { useToast } from '@/hooks/use-toast';


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
    toast({
      title: "Produto Adicionado!",
      description: `${product.name} (Tam: ${size}) foi adicionado ao seu carrinho.`,
      variant: "default",
    });
  }, [toast]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    let itemWasActuallyRemoved = false;
    let removedItemDescription: string | undefined;

    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return prevItems;

      const currentItem = prevItems[itemIndex];
      if (quantity <= 0) {
        removedItemDescription = `${currentItem.product.name} (Tam: ${currentItem.size})`;
        itemWasActuallyRemoved = true;
        return prevItems.filter(item => item.id !== itemId);
      }
      return prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      );
    });

    if (itemWasActuallyRemoved && removedItemDescription) {
      toast({
        title: "Produto Removido!",
        description: `${removedItemDescription} foi removido do carrinho.`,
        variant: "destructive",
      });
    }
  }, [toast]);

  const removeFromCart = useCallback((itemId: string) => {
    updateQuantity(itemId, 0); 
  }, [updateQuantity]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({
        title: "Carrinho Esvaziado",
        description: "Todos os itens foram removidos do carrinho.",
        variant: "default", 
    });
  }, [toast]);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = 0; 

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
