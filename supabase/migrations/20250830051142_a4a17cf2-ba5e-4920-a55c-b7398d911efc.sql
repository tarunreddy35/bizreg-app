-- Skip enum creation if exists, create tables and rest of the schema

-- Create businesses table for real-time business data
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  industry TEXT NOT NULL,
  business_structure business_structure_type NOT NULL,
  employee_count INTEGER NOT NULL DEFAULT 1,
  annual_revenue BIGINT, -- in USD
  founded_year INTEGER,
  website TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_businesses_state ON public.businesses(state);
CREATE INDEX IF NOT EXISTS idx_businesses_industry ON public.businesses(industry);
CREATE INDEX IF NOT EXISTS idx_businesses_structure ON public.businesses(business_structure);
CREATE INDEX IF NOT EXISTS idx_businesses_employee_count ON public.businesses(employee_count);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON public.businesses(created_at);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON public.businesses(is_active);

-- Add policy for public read access
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'businesses' AND policyname = 'Businesses are publicly readable') THEN
    CREATE POLICY "Businesses are publicly readable" 
    ON public.businesses 
    FOR SELECT 
    USING (true);
  END IF;
END $$;

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for businesses table
ALTER TABLE public.businesses REPLICA IDENTITY FULL;

-- Add to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'businesses'
  ) THEN
    ALTER publication supabase_realtime ADD TABLE public.businesses;
  END IF;
END $$;

-- Insert sample business data (will be expanded via edge function)
INSERT INTO public.businesses (business_name, state, city, country, industry, business_structure, employee_count, annual_revenue, founded_year, website, description, is_active) VALUES
('TechStart Solutions', 'California', 'San Francisco', 'United States', 'Information Technology', 'llc', 25, 2500000, 2020, 'https://techstart.com', 'Innovative software development company', true),
('Green Valley Farm', 'Iowa', 'Des Moines', 'United States', 'Agriculture', 'sole_proprietorship', 3, 450000, 2015, 'https://greenvalley.farm', 'Organic farming and produce distribution', true),
('Metro Construction', 'Texas', 'Houston', 'United States', 'Construction', 'corporation', 150, 15000000, 2010, 'https://metroconstruction.com', 'Commercial and residential construction services', true),
('Wellness Clinic', 'Florida', 'Miami', 'United States', 'Healthcare', 'partnership', 12, 1200000, 2018, 'https://wellnessclinic.com', 'Comprehensive healthcare and wellness services', true),
('Artisan Bakery', 'New York', 'Brooklyn', 'United States', 'Food Service', 'llc', 8, 350000, 2019, 'https://artisanbakery.com', 'Handcrafted breads and pastries', true)
ON CONFLICT (id) DO NOTHING;