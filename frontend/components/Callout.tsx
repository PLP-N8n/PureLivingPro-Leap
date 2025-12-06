import { cn } from "@/lib/utils";
import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { ReactNode } from "react";

interface CalloutProps {
  type?: "info" | "success" | "warning" | "danger";
  title?: string;
  children: ReactNode;
}

const calloutConfig = {
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-800",
    iconClassName: "text-blue-500",
  },
  success: {
    icon: CheckCircle,
    className: "bg-green-50 border-green-200 text-green-800",
    iconClassName: "text-green-500",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-800",
    iconClassName: "text-yellow-500",
  },
  danger: {
    icon: XCircle,
    className: "bg-red-50 border-red-200 text-red-800",
    iconClassName: "text-red-500",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div role="status" className={cn("my-6 p-6 border-l-4 rounded-r-lg", config.className)}>
      <div className="flex items-start gap-4">
        <Icon className={cn("h-6 w-6 flex-shrink-0 mt-1", config.iconClassName)} aria-hidden="true" />
        <div>
          {title && <h4 className="font-bold text-lg mb-2">{title}</h4>}
          <div className="prose prose-sm max-w-none">{children}</div>
        </div>
      </div>
    </div>
  );
}
