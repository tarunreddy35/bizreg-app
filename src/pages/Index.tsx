import { useState } from "react";
import { Header } from "@/components/Header";
import { BusinessForm } from "@/components/BusinessForm";
import { ComplianceResults } from "@/components/ComplianceResults";
import { BusinessDirectory } from "@/components/BusinessDirectory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [businessData, setBusinessData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("compliance");

  const handleFormSubmit = (data: any) => {
    setBusinessData(data);
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          {!showResults ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
                <TabsTrigger value="directory">Business Directory</TabsTrigger>
              </TabsList>
              
              <TabsContent value="compliance">
                <div className="max-w-4xl mx-auto space-y-8">
                  <Card className="w-full max-w-2xl mx-auto">
                    <div className="text-center space-y-4 rounded p-4 bg-[linear-gradient(135deg,_#2c3e50_0%,_#34495e_100%)]">
                      <h1 className="text-3xl font-bold text-white mb-0">
                        Business Compliance Made Simple
                      </h1>
                      <p className="text-l text-gray-400 mt-0 max-w-2xl mx-auto">
                        Enter your business information and we'll identify the specific regulations,
                        licenses, and compliance requirements that apply to your business.
                      </p>
                    </div>
                    <BusinessForm onSubmit={handleFormSubmit} />
                  </Card>

                  <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
                    <h3 className="font-semibold mb-2">How it works:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Tell us about your business structure, location, and industry</li>
                      <li>Our system analyzes federal, state, and local requirements</li>
                      <li>Get a personalized compliance checklist with actionable steps</li>
                    </ol>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="directory">
                <BusinessDirectory />
              </TabsContent>
            </Tabs>
          ) : (
            <ComplianceResults
              businessData={businessData}
              onBack={handleBack}
            />
          )}
        </main>
      </div>
    </>
  );
};

export default Index;
