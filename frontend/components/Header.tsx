import { Link } from "react-router-dom";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Pure Living Pro" 
              className="h-10 w-auto"
              onError={(e) => {
                // Fallback to text if logo fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'block';
              }}
            />
            <span className="text-xl font-bold text-gray-900 hidden">Pure Living Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Home
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-green-600 transition-colors">
              Blog
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-green-600 transition-colors">
              Products
            </Link>
            <Link to="/wellness-plan" className="text-gray-700 hover:text-green-600 transition-colors">
              Wellness Plan
            </Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-green-600 transition-colors">
              Dashboard
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
                <User className="h-4 w-4 mr-2" />
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
                  <Link to="/blog" className="text-gray-700 hover:text-green-600 transition-colors">
                    Blog
                  </Link>
                  <Link to="/products" className="text-gray-700 hover:text-green-600 transition-colors">
                    Products
                  </Link>
                  <Link to="/wellness-plan" className="text-gray-700 hover:text-green-600 transition-colors">
                    Wellness Plan
                  </Link>
                  <Link to="/dashboard" className="text-gray-700 hover:text-green-600 transition-colors">
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => setIsSearchOpen(true)}
                    className="justify-start p-0 h-auto font-normal text-gray-700 hover:text-green-600"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
