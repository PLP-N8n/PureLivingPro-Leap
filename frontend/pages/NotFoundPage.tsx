import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead } from "../components/SEOHead";
import { Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <>
      <SEOHead title="404 - Page Not Found" />
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <div className="inline-block bg-primary/10 p-6 rounded-full mb-6">
            <Search className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/">Go Back Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/insights">Explore Insights</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
