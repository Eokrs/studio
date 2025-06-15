
'use client';

import React, { useState /* useEffect */ } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // Comentado por enquanto
// import { supabase } from '@/lib/supabase'; // Comentado por enquanto
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
  // const router = useRouter(); // Comentado por enquanto
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  // const [isCheckingSession, setIsCheckingSession] = useState(true); // Removido por enquanto

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // useEffect(() => {
  //   console.log('LOGIN_PAGE_EFFECT: Iniciando verificação de sessão no cliente.');
  //   // Lógica de verificação de sessão será reintroduzida depois
  //   // setIsCheckingSession(false); 
  // }, [/* router */]); // Dependências serão revistas


  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoggingIn(true);
    setLoginError(null);
    console.log('LOGIN_PAGE_SUBMIT: Tentando login com:', data.email);

    // Simular chamada ao Supabase por enquanto
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('LOGIN_PAGE_SUBMIT: Simulação de login concluída.');
    toast({
      title: 'Login (Simulado) Bem-sucedido!',
      description: 'Você seria redirecionado agora.',
    });
    // Em um cenário real:
    // window.location.href = '/admin/dashboard';

    setIsLoggingIn(false);

    // Lógica real de login com Supabase será reintroduzida depois:
    // try {
    //   const { error } = await supabase.auth.signInWithPassword({
    //     email: data.email,
    //     password: data.password,
    //   });
    //   // ... restante da lógica ...
    // } catch (e: any) {
    //   // ... tratamento de erro ...
    // } finally {
    //   setIsLoggingIn(false);
    // }
  };

  // if (isCheckingSession) { // Lógica de carregamento será reintroduzida depois
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
  //       <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
  //       <p className="text-muted-foreground">Verificando sessão...</p>
  //     </div>
  //   );
  // }

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
