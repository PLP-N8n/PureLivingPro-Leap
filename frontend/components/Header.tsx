import { Link } from "react-router-dom";
import { Leaf, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">Pure Living Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Home
            </Link>
            <Link to="/category/nutrition" className="text-gray-700 hover:text-green-600 transition-colors">
              Nutrition
            </Link>
            <Link to="/category/fitness" className="text-gray-700 hover:text-green-600 transition-colors">
              Fitness
            </Link>
            <Link to="/category/wellness" className="text-gray-700 hover:text-green-600 transition-colors">
              Wellness
            </Link>
            <Link to="/category/recipes" className="text-gray-700 hover:text-green-600 transition-colors">
              Recipes
            </Link>
          </nav>

          {/* Search and Admin */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden sm:flex"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Link to="/admin">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
                    Home
                  </Link>
                  <Link to="/category/nutrition" className="text-gray-700 hover:text-green-600 transition-colors">
                    Nutrition
                  </Link>
                  <Link to="/category/fitness" className="text-gray-700 hover:text-green-600 transition-colors">
                    Fitness
                  </Link>
                  <Link to="/category/wellness" className="text-gray-700 hover:text-green-600 transition-colors">
                    Wellness
                  </Link>
                  <Link to="/category/recipes" className="text-gray-700 hover:text-green-600 transition-colors">
                    Recipes
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="pb-4">
            <div className="max-w-md mx-auto">
              <Input
                type="search"
                placeholder="Search articles..."
                className="w-full"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
