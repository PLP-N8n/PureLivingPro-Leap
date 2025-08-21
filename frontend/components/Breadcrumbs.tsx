import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        {items.map((item, index) => (
          <li key={item.name} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />}
            {item.href ? (
              <Link to={item.href} className="hover:text-primary transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className="font-medium text-gray-700">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
