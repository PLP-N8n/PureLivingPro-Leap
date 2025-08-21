import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AffiliateDisclosureProps {
  className?: string;
}

export function AffiliateDisclosure({ className = "" }: AffiliateDisclosureProps) {
  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <strong>Affiliate Disclosure:</strong> This post contains affiliate links. 
        If you purchase through these links, we may earn a commission at no additional 
        cost to you. We only recommend products we believe will benefit your health journey.
      </AlertDescription>
    </Alert>
  );
}
