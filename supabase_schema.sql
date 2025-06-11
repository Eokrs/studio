
-- Habilita a extensão uuid-ossp caso ainda não esteja habilitada,
-- para gerar UUIDs automaticamente.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remove a tabela se ela já existir, para evitar erros ao recriar.
DROP TABLE IF EXISTS products;

-- Cria a tabela 'products'
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL, -- URL da imagem
  category TEXT NOT NULL,
  dataAiHint TEXT,     -- Dica para IA (usado no front-end para placehold.co)
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insere alguns dados de exemplo na tabela 'products'
INSERT INTO products (name, description, image, category, dataAiHint, is_active) VALUES
('Smartphone Moderno Alpha', 'Tecnologia de ponta com design elegante e display vibrante.', 'https://placehold.co/600x800.png', 'Eletrônicos', 'smartphone modern', TRUE),
('Luminária de Mesa Industrial', 'Design rústico e charmoso para qualquer ambiente.', 'https://placehold.co/600x800.png', 'Decoração', 'desk lamp', TRUE),
('Camiseta Algodão Premium', 'Conforto e estilo para o seu dia a dia, feita com algodão 100% orgânico.', 'https://placehold.co/600x800.png', 'Vestuário', 'cotton t-shirt', TRUE),
('Fone de Ouvido Sem Fio Pro', 'Qualidade de som superior com cancelamento de ruído e longa duração de bateria.', 'https://placehold.co/600x800.png', 'Acessórios', 'wireless headphones', TRUE),
('Vaso de Cerâmica Artesanal', 'Peça única feita à mão, ideal para plantas pequenas ou como item decorativo.', 'https://placehold.co/600x800.png', 'Decoração', 'ceramic vase', TRUE),
('Smartwatch NextGen', 'Monitore sua saúde e atividades físicas com este smartwatch multifuncional.', 'https://placehold.co/600x800.png', 'Eletrônicos', 'smartwatch tech', FALSE), -- Exemplo de produto inativo
('Jaqueta Jeans Clássica', 'Um item essencial no guarda-roupa, versátil e atemporal.', 'https://placehold.co/600x800.png', 'Vestuário', 'denim jacket', TRUE),
('Mochila Urbana Resistente', 'Perfeita para o trabalho ou lazer, com múltiplos compartimentos e material durável.', 'https://placehold.co/600x800.png', 'Acessórios', 'urban backpack', TRUE),
('Câmera DSLR Profissional', 'Capture momentos incríveis com alta resolução e recursos avançados.', 'https://placehold.co/600x800.png', 'Eletrônicos', 'dslr camera', TRUE),
('Poltrona Confortável', 'Design moderno e ergonômico para o máximo de conforto.', 'https://placehold.co/600x800.png', 'Decoração', 'armchair modern', TRUE);

-- (Opcional) Habilitar Row Level Security (RLS) na tabela.
-- Supabase geralmente habilita RLS por padrão em novas tabelas.
-- Se não, você pode habilitar com:
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- (Opcional) Criar políticas de acesso (policies) para RLS.
-- Exemplo: Permitir que qualquer pessoa leia os produtos ativos.
-- DROP POLICY IF EXISTS "Public read access for active products" ON products;
-- CREATE POLICY "Public read access for active products"
-- ON products
-- FOR SELECT
-- USING (is_active = TRUE);

-- Exemplo: Permitir que usuários autenticados (anon key) leiam todos os produtos.
-- DROP POLICY IF EXISTS "Anon users can read all products" ON products;
-- CREATE POLICY "Anon users can read all products"
-- ON products
-- FOR SELECT
-- TO anon
-- USING (TRUE);

-- Lembre-se de ajustar as políticas conforme a necessidade da sua aplicação.
-- Para a configuração atual do projeto, onde a API key é 'anon', a política
-- "Anon users can read all products" (ou uma que permita acesso de leitura para 'anon' em produtos ativos)
-- seria a mais adequada se RLS estiver habilitada.

-- Por padrão, o Supabase Studio permite que você execute estas queries.
-- Verifique a seção "Table Editor" para ver os dados e "SQL Editor" para rodar/modificar este script.
-- As políticas de RLS são gerenciadas na seção "Authentication" -> "Policies".
