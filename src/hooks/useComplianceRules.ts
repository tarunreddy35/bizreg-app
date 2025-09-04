import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ComplianceRule = Database['public']['Tables']['compliance_rules']['Row'];
type BusinessSubmission = Database['public']['Tables']['business_submissions']['Row'];

export function useComplianceRules(businessData?: any) {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplicableRules = async (data: any) => {
    if (!data) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('compliance_rules')
        .select('*')
        .order('priority', { ascending: false });

      const { data: allRules, error } = await query;

      if (error) throw error;

      // Filter rules based on business criteria
      const applicableRules = (allRules || []).filter(rule => {
        // Check industry applicability
        if (rule.applicable_industries && rule.applicable_industries.length > 0) {
          if (!rule.applicable_industries.includes(data.industry)) {
            return false;
          }
        }

        // Check state applicability
        if (rule.applicable_states && rule.applicable_states.length > 0) {
          if (!rule.applicable_states.includes(data.state)) {
            return false;
          }
        }

        // Check business structure applicability
        if (rule.applicable_business_structures && rule.applicable_business_structures.length > 0) {
          if (!rule.applicable_business_structures.includes(data.businessStructure || data.business_structure)) {
            return false;
          }
        }

        // Check employee count
        const employeeCount = typeof data.employeeCount === 'string' 
          ? parseInt(data.employeeCount.split('-')[0]) || 1
          : data.employee_count || 1;

        if (rule.min_employee_count && employeeCount < rule.min_employee_count) {
          return false;
        }

        if (rule.max_employee_count && employeeCount > rule.max_employee_count) {
          return false;
        }

        return true;
      });

      setRules(applicableRules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const submitBusinessData = async (data: any) => {
    try {
      // Convert employee count string to number for database
      let employeeCount = 1;
      if (typeof data.employeeCount === 'string') {
        if (data.employeeCount === '1') employeeCount = 1;
        else if (data.employeeCount.includes('2-10')) employeeCount = 5;
        else if (data.employeeCount.includes('11-50')) employeeCount = 25;
        else if (data.employeeCount.includes('51-100')) employeeCount = 75;
        else if (data.employeeCount.includes('101-500')) employeeCount = 250;
        else if (data.employeeCount.includes('500+')) employeeCount = 750;
      }

      const submissionData = {
        business_name: data.businessName,
        state: data.state,
        industry: data.industry,
        business_structure: data.businessStructure as any,
        employee_count: employeeCount,
        annual_revenue: data.annualRevenue
      };

      const { error } = await supabase
        .from('business_submissions')
        .insert(submissionData);

      if (error) throw error;

      // Also fetch applicable rules
      await fetchApplicableRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit business data');
      throw err;
    }
  };

  useEffect(() => {
    if (businessData) {
      fetchApplicableRules(businessData);
    }
  }, [businessData]);

  return {
    rules,
    loading,
    error,
    submitBusinessData,
    fetchApplicableRules
  };
}