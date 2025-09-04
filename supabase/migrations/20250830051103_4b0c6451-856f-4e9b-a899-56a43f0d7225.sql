-- Create business structure enum
CREATE TYPE business_structure_type AS ENUM (
  'sole_proprietorship',
  'partnership', 
  'llc',
  'corporation',
  'cooperative',
  'nonprofit'
);

-- Create priority enum
CREATE TYPE priority_type AS ENUM ('high', 'medium', 'low');

-- Create rule type enum  
CREATE TYPE rule_type AS ENUM ('federal', 'state', 'local', 'industry');

-- Create businesses table for real-time business data
CREATE TABLE public.businesses (
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

-- Create compliance_rules table
CREATE TABLE public.compliance_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  applicable_industries TEXT[] DEFAULT '{}',
  applicable_states TEXT[] DEFAULT '{}',
  applicable_countries TEXT[] DEFAULT '{"United States"}',
  priority priority_type NOT NULL,
  rule_type rule_type NOT NULL,
  compliance_steps JSONB NOT NULL DEFAULT '[]',
  applicable_business_structures business_structure_type[] DEFAULT '{}',
  min_employee_count INTEGER DEFAULT 1,
  max_employee_count INTEGER,
  min_revenue BIGINT,
  max_revenue BIGINT,
  source TEXT NOT NULL,
  deadline TEXT,
  penalty TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_submissions table for form submissions
CREATE TABLE public.business_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  industry TEXT NOT NULL,
  business_structure business_structure_type NOT NULL,
  employee_count INTEGER NOT NULL,
  annual_revenue TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Businesses are publicly readable" 
ON public.businesses 
FOR SELECT 
USING (true);

CREATE POLICY "Compliance rules are publicly readable" 
ON public.compliance_rules 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can submit business data" 
ON public.business_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_businesses_state ON public.businesses(state);
CREATE INDEX idx_businesses_industry ON public.businesses(industry);
CREATE INDEX idx_businesses_structure ON public.businesses(business_structure);
CREATE INDEX idx_businesses_employee_count ON public.businesses(employee_count);
CREATE INDEX idx_businesses_created_at ON public.businesses(created_at);
CREATE INDEX idx_businesses_active ON public.businesses(is_active);

CREATE INDEX idx_compliance_industries ON public.compliance_rules USING GIN(applicable_industries);
CREATE INDEX idx_compliance_states ON public.compliance_rules USING GIN(applicable_states);
CREATE INDEX idx_compliance_structures ON public.compliance_rules USING GIN(applicable_business_structures);
CREATE INDEX idx_compliance_priority ON public.compliance_rules(priority);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_rules_updated_at
  BEFORE UPDATE ON public.compliance_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for businesses table
ALTER TABLE public.businesses REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.businesses;

-- Insert sample compliance rules
INSERT INTO public.compliance_rules (title, description, category, applicable_industries, applicable_states, priority, rule_type, compliance_steps, applicable_business_structures, min_employee_count, source, deadline, penalty) VALUES
('Employer Identification Number (EIN)', 'All businesses must obtain an EIN from the IRS for tax purposes', 'Tax Compliance', '{}', '{}', 'high', 'federal', '["Apply for EIN online at IRS.gov", "Provide business information and structure details", "Receive EIN confirmation letter", "Use EIN for all tax filings and business accounts"]', '{"sole_proprietorship", "partnership", "llc", "corporation"}', 1, 'Internal Revenue Service', 'Before conducting business', 'Unable to open business bank accounts, pay taxes'),

('Business Registration', 'Register your business entity with the state', 'Business Formation', '{}', '{}', 'high', 'state', '["Choose and reserve business name", "File articles of incorporation/organization", "Pay required state fees", "Obtain certificate of good standing"]', '{"llc", "corporation"}', 1, 'Secretary of State', 'Before conducting business', 'Fines up to $1,000, inability to enforce contracts'),

('Workers Compensation Insurance', 'Required for businesses with employees in most states', 'Insurance', '{}', '{}', 'high', 'state', '["Contact licensed insurance providers", "Determine coverage requirements for your industry", "Purchase policy before hiring employees", "Display required workplace posters"]', '{"sole_proprietorship", "partnership", "llc", "corporation"}', 2, 'State Insurance Department', 'Before hiring first employee', 'Fines $1,000-$5,000 per employee, criminal charges possible'),

('Sales Tax Registration', 'Required for businesses selling taxable goods or services', 'Tax Compliance', '{"Retail Trade", "Food Service", "Manufacturing"}', '{}', 'medium', 'state', '["Register with state revenue department", "Obtain sales tax permit", "Collect sales tax from customers", "File periodic sales tax returns"]', '{"sole_proprietorship", "partnership", "llc", "corporation"}', 1, 'State Revenue Department', 'Before making taxable sales', 'Penalties and interest on unpaid taxes'),

('OSHA Safety Standards', 'Workplace safety requirements for businesses with employees', 'Safety & Health', '{"Manufacturing", "Construction", "Healthcare"}', '{}', 'high', 'federal', '["Conduct workplace safety assessment", "Implement safety protocols", "Provide employee safety training", "Maintain safety records"]', '{"sole_proprietorship", "partnership", "llc", "corporation"}', 2, 'Occupational Safety and Health Administration', 'Within 30 days of hiring employees', 'Fines up to $15,625 per violation'),

('Professional License', 'Industry-specific professional licensing requirements', 'Licensing', '{"Healthcare", "Finance & Insurance", "Professional Services"}', '{}', 'high', 'state', '["Complete required education/training", "Pass licensing examination", "Submit license application", "Pay licensing fees", "Maintain continuing education"]', '{"sole_proprietorship", "partnership", "llc", "corporation"}', 1, 'State Professional Licensing Board', 'Before providing professional services', 'Cease and desist orders, fines up to $10,000'),

('Data Protection Compliance', 'Compliance with data privacy regulations', 'Data Protection', '{"Information Technology", "Healthcare", "Finance & Insurance"}', '{"California"}', 'medium', 'state', '["Conduct data privacy assessment", "Implement privacy policies", "Establish data breach procedures", "Train employees on data handling"]', '{"llc", "corporation"}', 5, 'State Privacy Agency', 'Within 90 days of processing personal data', 'Fines up to $7,500 per violation');

-- Insert sample business data (10,000+ entries will be generated via edge function)
INSERT INTO public.businesses (business_name, state, city, country, industry, business_structure, employee_count, annual_revenue, founded_year, website, description, is_active) VALUES
('TechStart Solutions', 'California', 'San Francisco', 'United States', 'Information Technology', 'llc', 25, 2500000, 2020, 'https://techstart.com', 'Innovative software development company', true),
('Green Valley Farm', 'Iowa', 'Des Moines', 'United States', 'Agriculture', 'sole_proprietorship', 3, 450000, 2015, 'https://greenvalley.farm', 'Organic farming and produce distribution', true),
('Metro Construction', 'Texas', 'Houston', 'United States', 'Construction', 'corporation', 150, 15000000, 2010, 'https://metroconstruction.com', 'Commercial and residential construction services', true),
('Wellness Clinic', 'Florida', 'Miami', 'United States', 'Healthcare', 'partnership', 12, 1200000, 2018, 'https://wellnessclinic.com', 'Comprehensive healthcare and wellness services', true),
('Artisan Bakery', 'New York', 'Brooklyn', 'United States', 'Food Service', 'llc', 8, 350000, 2019, 'https://artisanbakery.com', 'Handcrafted breads and pastries', true);