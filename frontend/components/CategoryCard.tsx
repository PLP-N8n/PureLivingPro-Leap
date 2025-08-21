import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    description: string;
    icon: React.ElementType;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link to={`/category/${category.slug}`} className="group block">
      <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:border-primary">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 group-hover:bg-primary/20">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
          <p className="text-gray-600 mb-4">{category.description}</p>
          <div className="inline-flex items-center text-primary font-semibold transition-transform duration-300 group-hover:translate-x-1">
            Explore <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
