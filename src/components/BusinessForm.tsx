import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building, MapPin, Users, DollarSign } from "lucide-react";

interface BusinessData {
  businessName: string;
  state: string;
  city: string;
  industry: string;
  businessStructure: string;
  employeeCount: string;
  annualRevenue: string;
}

interface BusinessFormProps {
  onSubmit: (data: BusinessData) => void;
}

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
  "Agriculture", "Construction", "Education", "Finance & Insurance", "Food Service",
  "Healthcare", "Information Technology", "Manufacturing", "Professional Services",
  "Real Estate", "Retail Trade", "Transportation", "Other"
];

export const BusinessForm = ({ onSubmit }: BusinessFormProps) => {
  const [formData, setFormData] = useState<BusinessData>({
    businessName: "",
    state: "",
    city: "",
    industry: "",
    businessStructure: "",
    employeeCount: "",
    annualRevenue: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof BusinessData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Building className="h-6 w-6 text-primary" />
          <span>Tell Us About Your Business</span>
        </CardTitle>
        <CardDescription>
          We'll use this information to identify the regulations that apply to your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                placeholder="Enter your business name"
                required
                className="mt-2"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state" className="flex items-center space-x-1 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>State</span>
                </Label>
                <Select value={formData.state} onValueChange={(value) => updateField("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city" className="mb-2 block">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Enter city"
                  required
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <Label htmlFor="industry" className="mb-2 block">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => updateField("industry", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Business Structure */}
            <div>
              <Label>Business Structure</Label>
              <RadioGroup
                value={formData.businessStructure}
                onValueChange={(value) => updateField("businessStructure", value)}
                className="grid grid-cols-2 gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sole-proprietorship" id="sole" />
                  <Label htmlFor="sole">Sole Proprietorship</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="llc" id="llc" />
                  <Label htmlFor="llc">LLC</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="corporation" id="corp" />
                  <Label htmlFor="corp">Corporation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partnership" id="partnership" />
                  <Label htmlFor="partnership">Partnership</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Employee Count */}
            <div>
              <Label htmlFor="employees" className="flex items-center space-x-1 mb-2">
                <Users className="h-4 w-4" />
                <span>Number of Employees</span>
              </Label>
              <Select value={formData.employeeCount} onValueChange={(value) => updateField("employeeCount", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Just me (1)</SelectItem>
                  <SelectItem value="2-10">2-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-100">51-100 employees</SelectItem>
                  <SelectItem value="101-500">101-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Annual Revenue */}
            <div>
              <Label htmlFor="revenue" className="flex items-center space-x-1 mb-2">
                <DollarSign className="h-4 w-4" />
                <span>Annual Revenue</span>
              </Label>
              <Select value={formData.annualRevenue} onValueChange={(value) => updateField("annualRevenue", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-50k">$0 - $50,000</SelectItem>
                  <SelectItem value="50k-250k">$50,000 - $250,000</SelectItem>
                  <SelectItem value="250k-1m">$250,000 - $1,000,000</SelectItem>
                  <SelectItem value="1m-5m">$1,000,000 - $5,000,000</SelectItem>
                  <SelectItem value="5m+">$5,000,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!formData.businessName || !formData.state || !formData.industry || !formData.businessStructure}
          >
            Analyze Compliance Requirements
          </Button>
        </form>
      </CardContent>
    </>
  );
};