'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Ainda pode ser útil para outros cenários, mas não para o redirect principal aqui
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter(); // Mantido caso necessário para outras lógicas
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    let didUnmount = false;
    console.log('LOGIN_PAGE_EFFECT: Iniciando verificação de sessão no cliente.');
  
    const checkSession = async () => {
      try {
        // Não precisamos de `supabase.auth.onAuthStateChange` aqui pois o middleware e 
        // `getSession` devem cuidar da sessão em mudanças de rota.
        const { data: { session }, error } = await supabase.auth.getSession();
  
        if (didUnmount) {
          console.log('LOGIN_PAGE_EFFECT: Componente desmontado antes da conclusão da verificação de sessão.');
          return;
        }
  
        if (error) {
          console.error('LOGIN_PAGE_EFFECT: Erro ao obter sessão via supabase.auth.getSession():', error.message);
          // Se houver erro, provavelmente não há sessão, então mostramos o form.
          setIsCheckingSession(false);
        } else if (session) {
          console.log('LOGIN_PAGE_EFFECT: Sessão encontrada no cliente. Redirecionando para /admin/dashboard via window.location.href.');
          // Força um full page reload para garantir que o middleware e o server-side state sejam atualizados.
          // Isso é crucial se o middleware não estiver pegando a sessão após um router.replace().
          window.location.href = '/admin/dashboard';
          // Como estamos fazendo um full redirect, não precisamos chamar setIsCheckingSession(false) aqui,
          // pois o componente será desmontado.
          return; 
        } else {
          console.log('LOGIN_PAGE_EFFECT: Nenhuma sessão encontrada no cliente. Exibindo formulário de login.');
          setIsCheckingSession(false);
        }
      } catch (err: any) {
        if (didUnmount) {
            console.log('LOGIN_PAGE_EFFECT: Componente desmontado durante catch.');
            return;
        }
        console.error('LOGIN_PAGE_EFFECT: Erro inesperado na promise supabase.auth.getSession():', err.message);
        setIsCheckingSession(false);
      }
    };
  
    checkSession();
  
    return () => {
      didUnmount = true;
      console.log('LOGIN_PAGE_EFFECT: Componente de login desmontado.');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem.

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const { error }_ = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast({
          title: 'Erro de Login',
          description: error.message || 'Falha ao autenticar. Verifique suas credenciais.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login bem-sucedido!',
          description: 'Redirecionando para o painel...',
        });
        // Forçar um full page reload para garantir que o middleware e o server-side state sejam atualizados.
        window.location.href = '/admin/dashboard';
      }
    } catch (e: any) {
      toast({
        title: 'Erro Inesperado',
        description: e.message || 'Ocorreu um erro durante o login.',
        variant: 'destructive',
      });
    } finally {
      // Se o login falhar e não houver redirecionamento, garantimos que o botão seja reativado.
      // Se o login for bem-sucedido, o window.location.href fará o componente desmontar.
      if (window.location.pathname === '/admin/login') { // Checa se ainda estamos na página de login
        setIsSubmitting(false);
      }
    }
  };

  if (isCheckingSession) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
     );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="w-full max-w-md p-8 space-y-6 glass-card shadow-2xl rounded-xl">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground font-headline">Painel Nuvyra Store</h1>
          <p className="text-muted-foreground">Acesso Administrativo</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-foreground/80">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@nuvyra.store"
              {...register('email')}
              className={`mt-1 bg-background/70 focus:bg-background ${errors.email ? 'border-destructive ring-destructive' : ''}`}
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password" className="text-foreground/80">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className={`mt-1 bg-background/70 focus:bg-background ${errors.password ? 'border-destructive ring-destructive' : ''}`}
            />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/80 transition-all duration-300 shadow-md hover:shadow-lg" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
