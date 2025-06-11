-- Supabase Schema for Vidro Showcase

-- Enable Row Level Security (RLS) on the products table
-- This is a good security practice. You'll need to define policies
-- for who can access the data.
-- Example:
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to products
-- This allows anyone (even unauthenticated users) to read all products.
-- Adjust as needed for your security requirements.
-- Example:
-- CREATE POLICY "Public products are viewable by everyone"
-- ON public.products
-- FOR SELECT
-- USING (true);

-- Policy to allow authenticated users to insert products (example)
-- CREATE POLICY "Allow authenticated users to insert products"
-- ON public.products
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (true);

-- Drop the table if it exists (for a clean start, be careful with existing data)
DROP TABLE IF EXISTS public.products;

-- Create the products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image TEXT, -- URL to the image
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some sample product data
INSERT INTO public.products (name, description, image, category) VALUES
('Smartphone Vision X', 'Tecnologia de ponta com display imersivo e câmera avançada.', 'https://placehold.co/600x800.png', 'Eletrônicos'),
('Luminária Nórdica Minimal', 'Design escandinavo que combina elegância e simplicidade.', 'https://placehold.co/600x800.png', 'Decoração'),
('Tênis Urbano Confort', 'Conforto e estilo para o dia a dia na cidade.', 'https://placehold.co/600x800.png', 'Vestuário'),
('Bolsa Transversal Couro Premium', 'Acessório sofisticado para complementar qualquer look.', 'https://placehold.co/600x800.png', 'Acessórios'),
('Fone de Ouvido Sem Fio AuraSound', 'Qualidade de som superior com cancelamento de ruído ativo.', 'https://placehold.co/600x800.png', 'Eletrônicos'),
('Vaso Cerâmica Artesanal Terra', 'Peça única feita à mão para adicionar charme ao ambiente.', 'https://placehold.co/600x800.png', 'Decoração'),
('Camisa Casual Algodão Pima', 'Tecido macio e respirável para máximo conforto.', 'https://placehold.co/600x800.png', 'Vestuário'),
('Relógio Clássico Elegance', 'Design atemporal com pulseira de aço inoxidável.', 'https://placehold.co/600x800.png', 'Acessórios'),
('Tablet Pro Performance 11"', 'Ideal para trabalho e entretenimento, com tela de alta resolução.', 'https://placehold.co/600x800.png', 'Eletrônicos'),
('Conjunto de Almofadas Geométricas', 'Adicione um toque moderno e aconchegante ao seu sofá.', 'https://placehold.co/600x800.png', 'Decoração');

-- Note on dataAiHint:
-- The 'dataAiHint' column was previously included. If you are re-running this script
-- on a database that had this column, it has been removed from this version.
-- If you encounter errors related to 'dataAiHint' not existing from your application,
-- ensure your application code (productActions.ts, Product interface, etc.) no longer
-- tries to select or use this column.

-- After running this script, ensure your RLS policies are set up correctly
-- if RLS is enabled on the 'products' table.
-- For public read access, you would typically need a policy like:
-- CREATE POLICY "Public products are viewable by everyone"
-- ON public.products
-- FOR SELECT
-- USING (is_active = true); -- Example: only show active products
-- OR for all products:
-- CREATE POLICY "Public products are viewable by everyone"
-- ON public.products
-- FOR SELECT
-- USING (true);

-- Remember to check your Supabase dashboard under Authentication -> Policies
-- for the 'products' table.
