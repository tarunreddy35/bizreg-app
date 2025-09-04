import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BusinessData {
  business_name: string;
  state: string;
  city: string;
  country: string;
  industry: string;
  business_structure: string;
  employee_count: number;
  annual_revenue: number;
  founded_year: number;
  website?: string;
  phone?: string;
  email?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
}

// Comprehensive data arrays for realistic generation
const US_STATES = [
  'California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia',
  'North Carolina', 'Michigan', 'New Jersey', 'Virginia', 'Washington', 'Arizona', 'Tennessee',
  'Massachusetts', 'Indiana', 'Missouri', 'Maryland', 'Wisconsin', 'Colorado', 'Minnesota',
  'South Carolina', 'Alabama', 'Louisiana', 'Kentucky', 'Oregon', 'Oklahoma', 'Connecticut',
  'Utah', 'Iowa', 'Nevada', 'Arkansas', 'Mississippi', 'Kansas', 'New Mexico', 'Nebraska',
  'West Virginia', 'Idaho', 'Hawaii', 'New Hampshire', 'Maine', 'Montana', 'Rhode Island',
  'Delaware', 'South Dakota', 'North Dakota', 'Alaska', 'Vermont', 'Wyoming'
];

const INDUSTRIES = [
  'Information Technology', 'Healthcare', 'Finance & Insurance', 'Professional Services',
  'Retail Trade', 'Manufacturing', 'Construction', 'Food Service', 'Transportation',
  'Education', 'Real Estate', 'Agriculture', 'Entertainment', 'Energy', 'Telecommunications',
  'Automotive', 'Pharmaceuticals', 'Aerospace', 'Media', 'E-commerce', 'Logistics',
  'Biotechnology', 'Chemical', 'Mining', 'Textiles', 'Consumer Goods', 'Gaming',
  'Sports', 'Tourism', 'Environmental Services'
];

const BUSINESS_STRUCTURES = ['sole_proprietorship', 'partnership', 'llc', 'corporation', 'cooperative', 'nonprofit'];

const CITY_DATA: Record<string, string[]> = {
  'California': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland'],
  'Texas': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi'],
  'Florida': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale'],
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon'],
  'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster'],
  'Illinois': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin'],
  'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton'],
  'Georgia': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Macon'],
  'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington'],
  'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing', 'Ann Arbor', 'Flint', 'Dearborn']
};

const BUSINESS_NAME_PREFIXES = [
  'Advanced', 'Global', 'Premier', 'Elite', 'Strategic', 'Innovative', 'Dynamic', 'Precision',
  'Summit', 'Prime', 'Alpha', 'Phoenix', 'Quantum', 'Stellar', 'Nexus', 'Vertex', 'Apex',
  'Metro', 'Urban', 'Central', 'Capital', 'Royal', 'Diamond', 'Platinum', 'Golden'
];

const BUSINESS_NAME_SUFFIXES = [
  'Solutions', 'Systems', 'Technologies', 'Services', 'Group', 'Corporation', 'Enterprises',
  'Industries', 'Holdings', 'Partners', 'Associates', 'Consulting', 'Works', 'Labs',
  'Studio', 'Center', 'Hub', 'Network', 'Alliance', 'Ventures'
];

function generateRandomBusiness(): BusinessData {
  const state = US_STATES[Math.floor(Math.random() * US_STATES.length)];
  const cities = CITY_DATA[state] || ['Springfield', 'Franklin', 'Georgetown', 'Madison', 'Clinton'];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
  const structure = BUSINESS_STRUCTURES[Math.floor(Math.random() * BUSINESS_STRUCTURES.length)];
  
  const prefix = BUSINESS_NAME_PREFIXES[Math.floor(Math.random() * BUSINESS_NAME_PREFIXES.length)];
  const suffix = BUSINESS_NAME_SUFFIXES[Math.floor(Math.random() * BUSINESS_NAME_SUFFIXES.length)];
  const businessName = `${prefix} ${suffix}`;
  
  const employeeCount = Math.floor(Math.random() * 1000) + 1;
  const revenue = Math.floor(Math.random() * 50000000) + 50000;
  const foundedYear = 2000 + Math.floor(Math.random() * 24);
  
  const domains = ['com', 'net', 'org', 'biz', 'co'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const website = `https://${businessName.toLowerCase().replace(/\s+/g, '')}.${domain}`;
  
  return {
    business_name: businessName,
    state,
    city,
    country: 'United States',
    industry,
    business_structure: structure,
    employee_count: employeeCount,
    annual_revenue: revenue,
    founded_year: foundedYear,
    website,
    phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    email: `contact@${businessName.toLowerCase().replace(/\s+/g, '')}.${domain}`,
    description: `${industry} company providing innovative solutions since ${foundedYear}`,
    latitude: 25 + Math.random() * 25, // Rough US latitude range
    longitude: -125 + Math.random() * 60, // Rough US longitude range
    is_active: Math.random() > 0.1 // 90% active businesses
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const count = parseInt(url.searchParams.get('count') || '100');
    const maxCount = Math.min(count, 1000); // Limit to 1000 per request

    console.log(`Generating ${maxCount} business records`);

    const businesses: BusinessData[] = [];
    for (let i = 0; i < maxCount; i++) {
      businesses.push(generateRandomBusiness());
    }

    // Insert in batches of 100 for better performance
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < businesses.length; i += batchSize) {
      batches.push(businesses.slice(i, i + batchSize));
    }

    let totalInserted = 0;
    for (const batch of batches) {
      const { data, error } = await supabaseClient
        .from('businesses')
        .insert(batch)
        .select('id');

      if (error) {
        console.error('Batch insert error:', error);
        throw error;
      }

      totalInserted += data?.length || 0;
      console.log(`Inserted batch: ${data?.length} records`);
    }

    // Get total count of businesses
    const { count: totalBusinesses } = await supabaseClient
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully generated ${totalInserted} business records`,
        totalInserted,
        totalBusinesses: totalBusinesses || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating business data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});