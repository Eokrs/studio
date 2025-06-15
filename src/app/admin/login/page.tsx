
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Uses createBrowserClient
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, LogIn, AlertTriangle, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  // Loader for initial session check - this page should not show if middleware redirects correctly
  const [isCheckingSession, setIsCheckingSession] = useState(true); 

  // This useEffect is a fallback. Ideally, the middleware handles redirecting
  // authenticated users away from /admin/login.
  useEffect(() => {
    console.log('LOGIN_PAGE_EFFECT: Running to check client-side session.');
    const checkClientSession = async () => {
      try {
        // Check session using the client-side Supabase instance
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('LOGIN_PAGE_EFFECT: Client-side session found. Redirecting to /admin/dashboard via window.location.href.');
          window.location.href = '/admin/dashboard'; // Force full page navigation
          return; // Important to prevent setIsCheckingSession(false) if redirecting
        } else {
          console.log('LOGIN_PAGE_EFFECT: No client-side session found.');
        }
      } catch (e: any) {
        console.error('LOGIN_PAGE_EFFECT: Error checking client-side session:', e.message);
      } finally {
        // Only set to false if not redirecting (though window.location.href should unmount)
        if (!window.location.pathname.endsWith('/admin/dashboard')) {
             setIsCheckingSession(false);
        }
      }
    };
    checkClientSession();
  }, []);


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoggingIn(true);
    setLoginError(null);
    console.log('LOGIN_PAGE_SUBMIT: Attempting login with Supabase for:', data.email);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('LOGIN_PAGE_SUBMIT: Error during Supabase login:', error.message);
        setLoginError(error.message.includes('Invalid login credentials') ? 'Email ou senha inválidos.' : `Erro no login: ${error.message}`);
        toast({
          title: 'Falha no Login',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoggingIn(false); // Re-enable form
      } else {
        console.log('LOGIN_PAGE_SUBMIT: Supabase login successful. Redirecting to /admin/dashboard via window.location.href.');
        toast({
          title: 'Login Bem-sucedido!',
          description: 'Você será redirecionado para o dashboard.',
        });
        // CRITICAL: Force full page navigation to ensure middleware processes new cookies
        window.location.href = '/admin/dashboard';
        // setIsLoggingIn(false) might not be reached if redirect happens quickly
      }
    } catch (e: any) {
      console.error('LOGIN_PAGE_SUBMIT: Exception during Supabase login attempt:', e.message);
      setLoginError('Ocorreu um erro inesperado. Tente novamente.');
      toast({
        title: 'Erro Inesperado',
        description: 'Ocorreu um erro inesperado durante o login.',
        variant: 'destructive',
      });
      setIsLoggingIn(false); // Re-enable form
    }
    // No finally setIsLoggingIn(false) here, as redirect should unmount.
    // If redirect fails, error handling above sets it.
  };
  
  if (isCheckingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-2xl glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <LogIn className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground font-headline">
            Admin Login
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Acesse o painel de controle da Nuvyra Store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...form.register('email')}
                className="bg-background/70 focus:bg-background"
                disabled={isLoggingIn}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive pt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register('password')}
                className="bg-background/70 focus:bg-background"
                disabled={isLoggingIn}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive pt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            {loginError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-start text-destructive text-sm">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80 text-base py-3" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {isLoggingIn ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Button variant="link" asChild className="mt-6 text-muted-foreground hover:text-primary">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" /> Voltar para a Loja
        </Link>
      </Button>
    </div>
  );
}
