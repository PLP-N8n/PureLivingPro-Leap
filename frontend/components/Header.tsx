import { Link } from "react-router-dom";
import { Search, Menu, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-green-200/50 sticky top-0 z-50 shadow-lg shadow-green-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/logo.svg" 
                alt="Pure Living Pro - Your Ultimate Wellness Companion" 
                className="h-12 w-auto transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
              <div className="hidden items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-green-600 to-lime-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300">
                    <Sparkles className="h-7 w-7 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-lime-400 to-green-400 rounded-full animate-bounce"></div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-lime-600 bg-clip-text text-transparent">
                    Pure Living Pro
                  </span>
                  <div className="text-xs text-slate-500 font-medium">Wellness Redefined</div>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/" className="relative px-4 py-2 text-slate-700 hover:text-green-600 rounded-xl transition-all duration-300 font-medium group">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-lime-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100"></div>
            </Link>
            <Link to="/blog" className="relative px-4 py-2 text-slate-700 hover:text-green-600 rounded-xl transition-all duration-300 font-medium group">
              <span className="relative z-10">Blog</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-lime-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100"></div>
            </Link>
            <Link to="/products" className="relative px-4 py-2 text-slate-700 hover:text-green-600 rounded-xl transition-all duration-300 font-medium group">
              <span className="relative z-10">Products</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-lime-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100"></div>
            </Link>
            <Link to="/wellness-plan" className="relative px-4 py-2 text-slate-700 hover:text-green-600 rounded-xl transition-all duration-300 font-medium group">
              <span className="relative z-10">Wellness Plan</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-lime-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100"></div>
            </Link>
            <Link to="/dashboard" className="relative px-4 py-2 text-slate-700 hover:text-green-600 rounded-xl transition-all duration-300 font-medium group">
              <span className="relative z-10">Dashboard</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-lime-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100"></div>
            </Link>
          </nav>

          {/* Search and Admin */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden sm:flex h-12 w-12 p-0 hover:bg-green-100/80 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
            >
              <Search className="h-5 w-5 text-slate-600" />
            </Button>
            
            <Link to="/admin">
              <Button variant="outline" size="sm" className="hidden sm:flex border-2 border-green-200/80 hover:border-green-500 hover:bg-green-50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <User className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden h-12 w-12 p-0 rounded-full hover:bg-green-100/80 transition-all duration-300 hover:scale-110">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80 bg-white/95 backdrop-blur-xl">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-lime-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-slate-900">Pure Living Pro</span>
                    <div className="text-xs text-slate-500">Wellness Redefined</div>
                  </div>
                </div>
                <nav className="flex flex-col space-y-2">
                  <Link to="/" className="px-4 py-3 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium">
                    Home
                  </Link>
                  <Link to="/blog" className="px-4 py-3 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium">
                    Blog
                  </Link>
                  <Link to="/products" className="px-4 py-3 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium">
                    Products
                  </Link>
                  <Link to="/wellness-plan" className="px-4 py-3 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium">
                    Wellness Plan
                  </Link>
                  <Link to="/dashboard" className="px-4 py-3 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium">
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => setIsSearchOpen(true)}
                    className="justify-start px-4 py-3 h-auto font-medium text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-xl"
                  >
                    <Search className="h-4 w-4 mr-3" />
                    Search
                  </Button>
                  <Link to="/admin" className="px-4 py-3 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium">
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
