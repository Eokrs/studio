
# Solução de Problemas Comuns do Supabase

Se você está encontrando erros ao tentar buscar dados do Supabase, como "Não foi possível carregar os produtos do banco de dados", siga estes passos:

## 1. Verifique os Logs Detalhados do Servidor

A mensagem de erro que você vê na interface do Next.js é uma mensagem genérica que nossa aplicação exibe. Para entender a causa raiz, você precisa verificar os logs no console do seu servidor (onde você executa `npm run dev` ou `next dev`).

No arquivo `src/app/actions/productActions.ts` (e arquivos similares), há uma linha como esta:
```typescript
console.error('Supabase error fetching products:', error);
```
O objeto `error` impresso aqui contém a mensagem de erro específica do Supabase. Esta é a informação mais importante para o diagnóstico.

## 2. Row Level Security (RLS)

A causa mais comum para falhas na leitura de dados, especialmente para acesso público, é a configuração incorreta ou ausente de políticas de Row Level Security (RLS) na sua tabela do Supabase.

### Verificando se RLS está Habilitado

1.  Vá para o seu painel do Supabase.
2.  Navegue até "Database" -> "Tables" e selecione sua tabela (ex: `products`).
3.  Verifique o status do RLS. Se estiver habilitado, você precisará de políticas para permitir o acesso.

### Adicionando Políticas RLS para Leitura Pública

Se o RLS estiver habilitado na sua tabela `products` e você quiser permitir que qualquer pessoa leia os dados (comum para uma vitrine de produtos públicos), você precisa adicionar uma política para a role `anon`.

Execute os seguintes comandos SQL no Editor SQL do seu Supabase:

**a. Habilitar RLS na tabela `products` (se ainda não estiver habilitado):**
   Você pode fazer isso pela interface do Supabase ou com o seguinte SQL:
   ```sql
   ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
   ```
   *Nota: Se o RLS já estiver habilitado, este comando não fará mal, mas pode não ser necessário.*

**b. Criar uma política para permitir leitura pública (SELECT) na tabela `products`:**
   ```sql
   CREATE POLICY "Public products are viewable by everyone"
   ON public.products
   FOR SELECT
   USING (true);
   ```
   Esta política permite que qualquer pessoa (incluindo usuários anônimos acessando com a `anon key`) execute operações `SELECT` na tabela `products`.

**Importante:** Se a política com o nome "Public products are viewable by everyone" já existir, o comando `CREATE POLICY` acima falhará. Você pode primeiro remover uma política existente com o mesmo nome usando:
   ```sql
   DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
   ```
   E então recriá-la com o comando `CREATE POLICY` acima.

Após aplicar essas configurações de RLS, tente carregar a página novamente.

## 3. Verifique suas Credenciais do Supabase

Certifique-se de que as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no seu arquivo `.env.local` estão corretas e correspondem ao seu projeto Supabase.

## 4. Estrutura da Tabela

Confirme se a tabela `products` existe e se possui todas as colunas que estão sendo selecionadas na query em `src/app/actions/productActions.ts` (por exemplo, `id, name, description, image, category, dataAiHint, created_at, is_active`).
O arquivo `supabase_schema.sql` fornecido anteriormente deve ter criado a estrutura correta.
```
