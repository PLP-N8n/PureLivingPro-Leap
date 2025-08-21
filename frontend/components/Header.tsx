import { Link } from "react-router-dom";
import { Search, Menu, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Pure Living Pro" 
                className="h-12 w-auto transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
              <div className="hidden items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Pure Living Pro
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-4 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
              Home
            </Link>
            <Link to="/blog" className="px-4 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
              Blog
            </Link>
            <Link to="/products" className="px-4 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
              Products
            </Link>
            <Link to="/wellness-plan" className="px-4 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
              Wellness Plan
            </Link>
            <Link to="/dashboard" className="px-4 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
              Dashboard
            </Link>
          </nav>

          {/* Search and Admin */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden sm:flex h-10 w-10 p-0 hover:bg-slate-100 rounded-full"
            >
              <Search className="h-5 w-5 text-slate-600" />
            </Button>
            
            <Link to="/admin">
              <Button variant="outline" size="sm" className="hidden sm:flex border-slate-200 hover:bg-slate-50">
                <User className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden h-10 w-10 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80">
                <div className="flex items-center space-x-2 mb-8">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-slate-900">Pure Living Pro</span>
                </div>
                <nav className="flex flex-col space-y-2">
                  <Link to="/" className="px-4 py-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
                    Home
                  </Link>
                  <Link to="/blog" className="px-4 py-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
                    Blog
                  </Link>
                  <Link to="/products" className="px-4 py-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
                    Products
                  </Link>
                  <Link to="/wellness-plan" className="px-4 py-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
                    Wellness Plan
                  </Link>
                  <Link to="/dashboard" className="px-4 py-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => setIsSearchOpen(true)}
                    className="justify-start px-4 py-3 h-auto font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
                  >
                    <Search className="h-4 w-4 mr-3" />
                    Search
                  </Button>
                  <Link to="/admin" className="px-4 py-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
                    <User className="h-4 w-4 mr-3 inline" />
                    Admin
                  </Link>
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
