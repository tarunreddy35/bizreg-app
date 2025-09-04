import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Business = Database['public']['Tables']['businesses']['Row'];

export interface BusinessFilters {
  state?: string;
  industry?: string;
  business_structure?: string;
  search?: string;
  min_employees?: number;
  max_employees?: number;
  min_revenue?: number;
  max_revenue?: number;
}

export function useBusinessData(filters: BusinessFilters = {}, limit = 50) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (filters.state) {
        query = query.eq('state', filters.state);
      }
      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters.business_structure) {
        query = query.eq('business_structure', filters.business_structure as any);
      }
      if (filters.search) {
        query = query.or(`business_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.min_employees) {
        query = query.gte('employee_count', filters.min_employees);
      }
      if (filters.max_employees) {
        query = query.lte('employee_count', filters.max_employees);
      }
      if (filters.min_revenue) {
        query = query.gte('annual_revenue', filters.min_revenue);
      }
      if (filters.max_revenue) {
        query = query.lte('annual_revenue', filters.max_revenue);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setBusinesses(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [JSON.stringify(filters), limit]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'businesses'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setBusinesses(prev => [payload.new as Business, ...prev.slice(0, limit - 1)]);
            setTotalCount(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            setBusinesses(prev => 
              prev.map(business => 
                business.id === payload.new.id ? payload.new as Business : business
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setBusinesses(prev => prev.filter(business => business.id !== payload.old.id));
            setTotalCount(prev => prev - 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const generateData = async (count: number = 100) => {
    try {
      const response = await supabase.functions.invoke('generate-business-data', {
        body: JSON.stringify({ count })
      });

      if (response.error) throw response.error;
      
      await fetchBusinesses(); // Refresh data after generation
      return response.data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate data');
    }
  };

  const exportData = async (format: 'json' | 'csv' | 'jsonl' = 'json', exportFilters: BusinessFilters = {}) => {
    try {
      const params = new URLSearchParams({ format });
      
      if (exportFilters.state) params.append('state', exportFilters.state);
      if (exportFilters.industry) params.append('industry', exportFilters.industry);
      if (exportFilters.business_structure) params.append('structure', exportFilters.business_structure);

      const response = await supabase.functions.invoke('export-business-data', {
        body: JSON.stringify(exportFilters)
      });

      if (response.error) throw response.error;
      
      return response.data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to export data');
    }
  };

  return {
    businesses,
    loading,
    error,
    totalCount,
    generateData,
    exportData,
    refresh: fetchBusinesses
  };
}