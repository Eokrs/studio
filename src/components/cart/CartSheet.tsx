
"use client";

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CartItemDisplay } from './CartItemDisplay';
import { ShoppingCart, XIcon, Trash2 } from 'lucide-react'; // Added XIcon for close

interface CartSheetProps {
  children: React.ReactNode; // For the trigger
}

export function CartSheet({ children }: CartSheetProps) {
  const { cartItems, itemCount, clearCart } = useCart();
  const whatsappNumber = "5522999586820";

  const handleFinalizeOrder = () => {
    if (itemCount === 0) return;

    let message = "Olá, gostaria de adquirir os seguintes produtos:\n";
    cartItems.forEach(item => {
      message += `- ${item.product.name} x${item.quantity}\n`;
    });
    
    const encodedMessage = encodeURIComponent(message.trim());
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    // clearCart(); // Optional: clear cart after sending
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-background/90 dark:bg-background/80 backdrop-blur-lg border-border/50">
        <SheetHeader className="p-6 border-b border-border/50">
          <SheetTitle className="text-lg font-semibold text-foreground">Seu Carrinho ({itemCount})</SheetTitle>
        </SheetHeader>
        
        {itemCount === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <SheetClose asChild>
                <Button variant="outline" className="mt-4">Continuar comprando</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-grow p-6">
              <div className="space-y-2">
                {cartItems.map(item => (
                  <CartItemDisplay key={item.product.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="p-6 border-t border-border/50 bg-background/70 dark:bg-background/60 backdrop-blur-sm mt-auto">
              <div className="w-full space-y-3">
                <Button 
                  onClick={handleFinalizeOrder} 
                  className="w-full text-white font-semibold rounded-md transition-all duration-300 shadow-lg backdrop-blur-md border border-white/20 dark:border-white/10 bg-[#25D366]/[0.7] hover:bg-[#25D366]/[0.85] dark:bg-[#25D366]/[0.5] dark:hover:bg-[#25D366]/[0.65] hover:shadow-xl"
                  size="lg"
                >
                  Finalizar Pedido pelo WhatsApp
                </Button>
                <Button 
                    variant="outline" 
                    onClick={clearCart} 
                    className="w-full border-destructive text-destructive hover:bg-destructive/10"
                    size="lg"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Esvaziar Carrinho
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
