import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const format = url.searchParams.get('format') || 'json';
    const limit = parseInt(url.searchParams.get('limit') || '10000');
    const state = url.searchParams.get('state');
    const industry = url.searchParams.get('industry');
    const structure = url.searchParams.get('structure');

    console.log(`Exporting business data in ${format} format with limit ${limit}`);

    let query = supabaseClient
      .from('businesses')
      .select('*')
      .limit(limit);

    // Apply filters if provided
    if (state) {
      query = query.eq('state', state);
    }
    if (industry) {
      query = query.eq('industry', industry);
    }
    if (structure) {
      query = query.eq('business_structure', structure);
    }

    const { data: businesses, error } = await query;

    if (error) {
      throw error;
    }

    let responseContent: string;
    let contentType: string;
    let filename: string;

    switch (format.toLowerCase()) {
      case 'csv':
        responseContent = convertToCSV(businesses || []);
        contentType = 'text/csv';
        filename = 'businesses.csv';
        break;
      case 'jsonl':
        responseContent = businesses?.map(b => JSON.stringify(b)).join('\n') || '';
        contentType = 'application/x-ndjson';
        filename = 'businesses.jsonl';
        break;
      case 'parquet':
        // For now, return JSON with note about parquet
        responseContent = JSON.stringify({
          note: 'Parquet format not yet implemented. Use CSV or JSONL for now.',
          data: businesses
        }, null, 2);
        contentType = 'application/json';
        filename = 'businesses.json';
        break;
      default:
        responseContent = JSON.stringify(businesses, null, 2);
        contentType = 'application/json';
        filename = 'businesses.json';
    }

    return new Response(responseContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error exporting business data:', error);
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

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle null, undefined, and string values with commas/quotes
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}