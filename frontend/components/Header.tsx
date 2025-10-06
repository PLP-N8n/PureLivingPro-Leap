import { Link } from "react-router-dom";
import { Search, Menu, User, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "bg-white/80 backdrop-blur-xl border-b border-green-200/50 sticky top-0 z-50 transition-all duration-300",
      isScrolled ? "shadow-lg shadow-green-200/20 h-16" : "h-20"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src="/logo.svg"
                alt="Pure Living Pro Logo"
                className={cn("group-hover:scale-110 transition-all duration-300", isScrolled ? "w-10 h-10" : "w-12 h-12")}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/logo.png";
                  target.onerror = () => {
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  };
                }}
              />
              <div className={cn("bg-gradient-to-br from-green-500 via-green-600 to-lime-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300", isScrolled ? "w-10 h-10" : "w-12 h-12")} style={{ display: "none" }}>
                <Leaf className={cn("text-white animate-pulse", isScrolled ? "h-6 w-6" : "h-7 w-7")} />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-lime-600 bg-clip-text text-transparent">
                Pure Living Pro
              </span>
              <div className={cn("text-xs text-slate-500 font-medium transition-opacity duration-300", isScrolled ? "opacity-0" : "opacity-100")}>Wellness Redefined</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/insights" className="relative px-4 py-2 text-slate-700 hover:text-primary rounded-xl transition-all duration-300 font-medium group">
              <span className="relative z-10">Insights</span>
              <div className="absolute inset-0 bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100"></div>
            </Link>
            <Link to="/picks" className="relative px-4 py-2 text-slate-700 hover:text-primary rounded-xl transition-all duration-300 font-medium group">
              <span className="relative z-10">Our Picks</span>
              <div className="absolute inset-0 bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100"></div>
            </Link>
            <Link to="/about" className="relative px-4 py-2 text-slate-700 hover:text-primary rounded-xl transition-all duration-300 font-medium group">
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100"></div>
            </Link>
          </nav>

          {/* Search and Admin */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden sm:flex h-10 w-10 p-0 hover:bg-primary/10 rounded-full transition-all duration-300 hover:scale-110"
            >
              <Search className="h-5 w-5 text-slate-600" />
            </Button>
            
            <Link to="/admin">
              <Button variant="outline" size="sm" className="hidden sm:flex border-2 border-primary/20 hover:border-primary hover:bg-primary/10 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                <User className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden h-10 w-10 p-0 rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80 bg-white/95 backdrop-blur-xl">
                <div className="flex items-center space-x-3 mb-8">
                  <img
                    src="/logo.svg"
                    alt="Pure Living Pro Logo"
                    className="w-10 h-10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/logo.png";
                      target.onerror = () => {
                        target.style.display = "none";
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      };
                    }}
                  />
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-lime-600 rounded-xl flex items-center justify-center shadow-lg" style={{ display: "none" }}>
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-slate-900">Pure Living Pro</span>
                    <div className="text-xs text-slate-500">Wellness Redefined</div>
                  </div>
                </div>
                <nav className="flex flex-col space-y-2">
                  <Link to="/insights" className="px-4 py-3 text-slate-700 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 font-medium">
                    Insights
                  </Link>
                  <Link to="/picks" className="px-4 py-3 text-slate-700 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 font-medium">
                    Our Picks
                  </Link>
                  <Link to="/about" className="px-4 py-3 text-slate-700 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 font-medium">
                    About
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => setIsSearchOpen(true)}
                    className="justify-start px-4 py-3 h-auto font-medium text-slate-700 hover:text-primary hover:bg-primary/10 rounded-xl"
                  >
                    <Search className="h-4 w-4 mr-3" />
                    Search
                  </Button>
                  <Link to="/admin" className="px-4 py-3 text-slate-700 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 font-medium">
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
