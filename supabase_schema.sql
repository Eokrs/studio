
-- Criação da tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT, -- URL da imagem
  category TEXT,
  dataAiHint TEXT, -- Adicionada a coluna dataAiHint
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários sobre a tabela e colunas (opcional, mas bom para documentação)
COMMENT ON TABLE public.products IS 'Tabela para armazenar informações sobre os produtos da Vidro Showcase.';
COMMENT ON COLUMN public.products.id IS 'Identificador único para cada produto (UUID).';
COMMENT ON COLUMN public.products.name IS 'Nome do produto.';
COMMENT ON COLUMN public.products.description IS 'Descrição detalhada do produto.';
COMMENT ON COLUMN public.products.image IS 'URL da imagem principal do produto.';
COMMENT ON COLUMN public.products.category IS 'Categoria à qual o produto pertence (ex: Eletrônicos, Decoração).';
COMMENT ON COLUMN public.products.dataAiHint IS 'Dica para IA sobre o conteúdo da imagem (ex: "modern smartphone").';
COMMENT ON COLUMN public.products.is_active IS 'Indica se o produto está ativo e deve ser exibido (TRUE) ou não (FALSE).';
COMMENT ON COLUMN public.products.created_at IS 'Data e hora de criação do registro do produto.';

-- Inserção de dados de exemplo (mock data)
-- Certifique-se de que as URLs das imagens sejam válidas ou use placeholders
INSERT INTO public.products (name, description, image, category, dataAiHint, is_active) VALUES
('Smartphone Avançado Pro', 'Tecnologia de ponta com design elegante, display OLED vibrante e câmeras de alta resolução.', 'https://placehold.co/600x800.png', 'Eletrônicos', 'smartphone modern', TRUE),
('Luminária de Mesa Minimalista', 'Design escandinavo, iluminação suave e ajustável, perfeita para leitura ou trabalho.', 'https://placehold.co/600x800.png', 'Decoração', 'desk lamp', TRUE),
('Tênis Esportivo ConfortMax', 'Ideal para corridas e treinos, com amortecimento responsivo e cabedal respirável.', 'https://placehold.co/600x800.png', 'Vestuário', 'sports shoes', TRUE),
('Fone de Ouvido Sem Fio SoundWave', 'Qualidade de som imersiva, cancelamento de ruído ativo e bateria de longa duração.', 'https://placehold.co/600x800.png', 'Eletrônicos', 'wireless headphones', TRUE),
('Vaso Decorativo Geométrico', 'Peça central elegante para sua sala, feito em cerâmica com acabamento fosco.', 'https://placehold.co/600x800.png', 'Decoração', 'geometric vase', FALSE),
('Smartwatch Fitness Tracker', 'Monitore sua saúde e atividades físicas com estilo. GPS integrado e múltiplos modos esportivos.', 'https://placehold.co/600x800.png', 'Eletrônicos', 'fitness smartwatch', TRUE),
('Mochila Urbana Antifurto', 'Design moderno e funcional, com compartimentos seguros e material resistente à água.', 'https://placehold.co/600x800.png', 'Acessórios', 'urban backpack', TRUE),
('Jaqueta Corta-Vento Performance', 'Leve, compacta e resistente ao vento, perfeita para atividades ao ar livre.', 'https://placehold.co/600x800.png', 'Vestuário', 'windbreaker jacket', TRUE),
('Kit de Potes Herméticos Cozinha', 'Organize sua despensa com estilo. Mantém os alimentos frescos por mais tempo.', 'https://placehold.co/600x800.png', 'Utilidades Domésticas', 'kitchen canisters', TRUE),
('Cadeira Gamer Ergonômica X Racer', 'Conforto máximo para longas sessões de jogo, com ajustes personalizáveis e design arrojado.', 'https://placehold.co/600x800.png', 'Móveis', 'gaming chair', TRUE);

-- Exemplo de como habilitar Row Level Security (RLS) na tabela (se ainda não estiver habilitado)
-- Você pode fazer isso pela interface do Supabase ou com o seguinte SQL:
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- IMPORTANTE: Se você habilitar RLS, precisará criar políticas para permitir o acesso.

-- Exemplo de política para permitir leitura pública (SELECT) na tabela products:
-- CREATE POLICY "Public products are viewable by everyone"
-- ON public.products
-- FOR SELECT
-- USING (true);

-- Exemplo de política para permitir que usuários autenticados insiram produtos:
-- CREATE POLICY "Allow authenticated users to insert products"
-- ON public.products
-- FOR INSERT
-- WITH CHECK (auth.role() = 'authenticated');

-- Exemplo de política para permitir que usuários donos de um produto (ou administradores) o atualizem/deletem:
-- (Supondo uma coluna user_id na tabela products que armazena o ID do usuário criador)
-- CREATE POLICY "Allow owners to update their products"
-- ON public.products
-- FOR UPDATE
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Allow owners to delete their products"
-- ON public.products
-- FOR DELETE
-- USING (auth.uid() = user_id);

-- Lembre-se de adaptar as políticas RLS às suas necessidades específicas de segurança.
-- Para o projeto atual, onde os produtos são públicos, a política "Public products are viewable by everyone" é a mais relevante.
-- Se a sua tabela já tiver a política "Public products are viewable by everyone" de um passo anterior,
-- você pode precisar rodar: DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
-- antes de recriá-la se estiver fazendo alterações na estrutura da tabela que afetem a política.
-- No entanto, para adicionar uma coluna, geralmente não é necessário recriar a política de SELECT.
