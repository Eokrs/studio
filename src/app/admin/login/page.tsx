
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase'; // Standard client-side Supabase instance for signIn
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
  const router = useRouter();
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
    console.log('LOGIN_PAGE_EFFECT: Iniciando verificação de sessão no cliente.');
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('LOGIN_PAGE_EFFECT: Erro ao obter sessão via supabase.auth.getSession():', error.message);
          setIsCheckingSession(false); // Houve um erro, esconder o loader.
          return;
        }
        
        if (session) {
          console.log('LOGIN_PAGE_EFFECT: Sessão encontrada no cliente. Redirecionando para /admin/dashboard.');
          router.replace('/admin/dashboard');
          // Se formos redirecionados, o componente será desmontado, então não precisamos
          // definir isCheckingSession como false aqui, pois o loader não estará mais visível.
        } else {
          console.log('LOGIN_PAGE_EFFECT: Nenhuma sessão encontrada no cliente. Exibindo formulário de login.');
          setIsCheckingSession(false); // Nenhuma sessão, esconder o loader.
        }
      })
      .catch((err) => {
        // Este catch é para erros na própria promise, como falhas de rede.
        console.error('LOGIN_PAGE_EFFECT: Erro inesperado na promise supabase.auth.getSession():', err.message);
        setIsCheckingSession(false); // Erro inesperado, esconder o loader.
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem.

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
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
      setIsSubmitting(false);
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
