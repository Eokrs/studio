
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // Kept commented, using window.location.href
import { supabase } from '@/lib/supabase';
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
  const [isCheckingSession, setIsCheckingSession] = useState(true); // Start true to show loader

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    console.log('LOGIN_PAGE_EFFECT: Iniciando verificação de sessão no cliente.');
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('LOGIN_PAGE_EFFECT: Erro ao verificar sessão no cliente:', error.message);
          // Allow page to load normally for user to attempt login
        } else if (session) {
          console.log('LOGIN_PAGE_EFFECT: Sessão encontrada no cliente. Redirecionando para /admin/dashboard.');
          window.location.href = '/admin/dashboard'; // Use full page navigation
          return; // Important to prevent setIsCheckingSession(false) if redirecting
        } else {
          console.log('LOGIN_PAGE_EFFECT: Nenhuma sessão encontrada no cliente. Exibindo formulário de login.');
        }
      } catch (e: any) {
        console.error('LOGIN_PAGE_EFFECT: Exceção ao verificar sessão no cliente:', e.message);
        // Allow page to load normally
      } finally {
        // Only set to false if not redirecting
        if (!window.location.pathname.endsWith('/admin/dashboard')) { // Basic check
             setIsCheckingSession(false);
        }
      }
    };
    checkSession();
  }, []); // Empty dependency array, run once on mount


  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoggingIn(true);
    setLoginError(null);
    console.log('LOGIN_PAGE_SUBMIT: Tentando login com Supabase para:', data.email);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('LOGIN_PAGE_SUBMIT: Erro no login com Supabase:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          setLoginError('Email ou senha inválidos. Verifique e tente novamente.');
        } else {
          setLoginError(`Erro no login: ${error.message}`);
        }
        toast({
          title: 'Falha no Login',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        console.log('LOGIN_PAGE_SUBMIT: Login com Supabase bem-sucedido. Redirecionando para /admin/dashboard.');
        toast({
          title: 'Login Bem-sucedido!',
          description: 'Você será redirecionado para o dashboard.',
        });
        // Forçar uma navegação completa para que o middleware possa processar a nova sessão
        window.location.href = '/admin/dashboard';
      }
    } catch (e: any) {
      console.error('LOGIN_PAGE_SUBMIT: Exceção durante o login com Supabase:', e.message);
      setLoginError('Ocorreu um erro inesperado durante o login. Tente novamente.');
      toast({
        title: 'Erro Inesperado',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
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
