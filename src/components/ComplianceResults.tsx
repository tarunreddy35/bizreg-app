import { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Clock, ArrowLeft } from "lucide-react";

interface ComplianceRule {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  ruleType: "federal" | "state" | "local";
  source: string;
  deadline?: string;
  penalty?: string;
  compliance_steps: string[];
}

interface ComplianceResultsProps {
  businessData: any;
  onBack: () => void;
}

export const ComplianceResults = ({ businessData, onBack }: ComplianceResultsProps) => {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRules() {
      setLoading(true);

      const prompt = `
You are a compliance assistant. Generate 4-6 US compliance rules for a business:
Business Name: ${businessData.businessName}
Industry: ${businessData.industry}
State: ${businessData.state}
Employees: ${businessData.employeeCount}

Return JSON array of objects with:
id, title, description, category, priority ("high","medium","low"), ruleType ("federal","state","local"), source, deadline (optional), penalty (optional), compliance_steps (3-5 steps).
Return ONLY JSON.
`;

      try {
        // Debug: Log the Gemini API key being used
        console.log("Gemini API Key:", import.meta.env.VITE_GEMINI_API_KEY);
        // Init Gemini client
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const result = await model.generateContent(prompt);
  let text = result.response.text();
  // Remove Markdown code block markers if present
  text = text.replace(/^```json[\r\n]+|```$/gim, '').trim();
  // Parse JSON safely
  const parsed = JSON.parse(text);
  setRules(parsed);

      } catch (err) {
        console.error("Gemini fetch failed:", err);
        setRules([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRules();
  }, [businessData]);

  if (loading) return <div className="text-center mt-20">Loading compliance rules...</div>;

  const highPriorityRules = rules.filter(rule => rule.priority === "high");
  const mediumPriorityRules = rules.filter(rule => rule.priority === "medium");
  const lowPriorityRules = rules.filter(rule => rule.priority === "low");

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "medium": return <Clock className="h-5 w-5 text-warning" />;
      case "low": return <CheckCircle className="h-5 w-5 text-success" />;
      default: return null;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const RuleCard = ({ rule }: { rule: any }) => (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getPriorityIcon(rule.priority)}
              <CardTitle className="text-lg">{rule.title}</CardTitle>
            </div>
            <div className="flex space-x-2">
              <Badge variant={getPriorityBadgeVariant(rule.priority)}>
                {(rule.priority ? rule.priority.toUpperCase() : "UNKNOWN")}
              </Badge>
              <Badge variant="outline">{(rule.rule_type ? rule.rule_type.toUpperCase() : "UNKNOWN")}</Badge>
            </div>
          </div>
          <CardDescription>{rule.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Source:</strong> {rule.source}</div>
              <div><strong>Category:</strong> {rule.category}</div>
              {rule.deadline && <div><strong>Deadline:</strong> {rule.deadline}</div>}
              {rule.penalty && <div><strong>Penalty:</strong> {rule.penalty}</div>}
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Compliance Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {rule.compliance_steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Compliance Analysis for {businessData.businessName}</CardTitle>
              <CardDescription>
                {businessData.businessStructure} • {businessData.industry} • {businessData.state}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Form
            </Button>
          </div>
        </CardHeader>
      </Card>

      {highPriorityRules.length > 0 && <div><h2 className="text-xl font-semibold mb-4 text-destructive">🚨 High Priority</h2>{highPriorityRules.map(rule => <RuleCard key={rule.id} rule={rule} />)}</div>}
      {mediumPriorityRules.length > 0 && <div><h2 className="text-xl font-semibold mb-4 text-warning">⚠️ Medium Priority</h2>{mediumPriorityRules.map(rule => <RuleCard key={rule.id} rule={rule} />)}</div>}
      {lowPriorityRules.length > 0 && <div><h2 className="text-xl font-semibold mb-4 text-success">✅ Low Priority</h2>{lowPriorityRules.map(rule => <RuleCard key={rule.id} rule={rule} />)}</div>}
    </div>
  );
};
