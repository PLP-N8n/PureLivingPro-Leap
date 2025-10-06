import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    description: string;
    icon: React.ElementType;
    imageUrl?: string;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link to={`/category/${category.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:border-primary">
        {category.imageUrl && (
          <div className="relative h-40 overflow-hidden">
            <img 
              src={category.imageUrl} 
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
              <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
          </div>
        )}
        <CardContent className="p-6 text-center">
          {!category.imageUrl && (
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 group-hover:bg-primary/20">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          )}
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
