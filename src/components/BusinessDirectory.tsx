import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useBusinessData, type BusinessFilters } from "@/hooks/useBusinessData";
import { 
  Search, Filter, Download, RefreshCw, Building2, MapPin, Users, 
  DollarSign, Globe, Phone, Mail, Calendar, Activity, TrendingUp 
} from "lucide-react";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const INDUSTRIES = [
  "Information Technology", "Healthcare", "Finance & Insurance", "Professional Services",
  "Retail Trade", "Manufacturing", "Construction", "Food Service", "Transportation",
  "Education", "Real Estate", "Agriculture", "Entertainment", "Energy", "Telecommunications"
];

const BUSINESS_STRUCTURES = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "Corporation" },
  { value: "cooperative", label: "Cooperative" },
  { value: "nonprofit", label: "Nonprofit" }
];

export const BusinessDirectory = () => {
  const [filters, setFilters] = useState<BusinessFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const { businesses, loading, error, totalCount, generateData, exportData, refresh } = useBusinessData(filters, 100);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleFilterChange = (key: keyof BusinessFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const handleGenerateData = async (count: number) => {
    setGenerating(true);
    try {
      const result = await generateData(count);
      toast({
        title: "Data Generated",
        description: `Successfully generated ${result.totalInserted} new business records`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate data",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv' | 'jsonl') => {
    setExporting(true);
    try {
      const data = await exportData(format, filters);
      
      // Create blob and download
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `businesses.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Data exported successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getStructureLabel = (structure: string) => {
    return BUSINESS_STRUCTURES.find(s => s.value === structure)?.label || structure;
  };

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Error loading business data: {error}</p>
            <Button onClick={refresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Building2 className="h-6 w-6 mr-2" />
                Business Directory
              </CardTitle>
              <CardDescription>
                Real-time business data with advanced filtering and export capabilities
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Activity className="h-3 w-3 mr-1" />
                {totalCount.toLocaleString()} businesses
              </Badge>
              <Button onClick={refresh} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* Data Generation */}
            <div className="flex space-x-2">
              <Button
                onClick={() => handleGenerateData(100)}
                disabled={generating}
                variant="secondary"
              >
                {generating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                Generate 100
              </Button>
              <Button
                onClick={() => handleGenerateData(1000)}
                disabled={generating}
                variant="secondary"
              >
                Generate 1K
              </Button>
            </div>

            {/* Export Options */}
            <div className="flex space-x-2">
              <Button
                onClick={() => handleExportData('json')}
                disabled={exporting}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button
                onClick={() => handleExportData('csv')}
                disabled={exporting}
                variant="outline"
                size="sm"
              >
                CSV
              </Button>
              <Button
                onClick={() => handleExportData('jsonl')}
                disabled={exporting}
                variant="outline"
                size="sm"
              >
                JSONL
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="state-filter">State</Label>
                  <Select value={filters.state || ""} onValueChange={(value) => handleFilterChange('state', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All states" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All states</SelectItem>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="industry-filter">Industry</Label>
                  <Select value={filters.industry || ""} onValueChange={(value) => handleFilterChange('industry', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All industries</SelectItem>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="structure-filter">Business Structure</Label>
                  <Select value={filters.business_structure || ""} onValueChange={(value) => handleFilterChange('business_structure', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All structures" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All structures</SelectItem>
                      {BUSINESS_STRUCTURES.map(structure => (
                        <SelectItem key={structure.value} value={structure.value}>{structure.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={clearFilters} variant="outline" className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card key={business.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-start justify-between">
                  <span className="truncate">{business.business_name}</span>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {getStructureLabel(business.business_structure)}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {business.city}, {business.state}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Industry</span>
                    <Badge variant="secondary">{business.industry}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Employees
                    </span>
                    <span>{business.employee_count.toLocaleString()}</span>
                  </div>

                  {business.annual_revenue && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Revenue
                      </span>
                      <span>{formatCurrency(business.annual_revenue)}</span>
                    </div>
                  )}

                  {business.founded_year && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Founded
                      </span>
                      <span>{business.founded_year}</span>
                    </div>
                  )}

                  {business.description && (
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-2">{business.description}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    {business.website && (
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-primary"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        Website
                      </a>
                    )}
                    {business.phone && (
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {business.phone}
                      </span>
                    )}
                    {business.email && (
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {businesses.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No businesses found matching your criteria.</p>
              <Button onClick={clearFilters} variant="outline" className="mt-4">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};