import { Shield } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">ComplianceGuard</h1>
            <p className="text-sm text-muted-foreground">Business Compliance Made Simple</p>
          </div>
        </div>
      </div>
    </header>
  );
};