import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <>
      <footer className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.02\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-6 group">
                <img 
                  src="/logo.png" 
                  alt="Pure Living Pro" 
                  className="h-12 w-auto transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
                <div className="hidden items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Pure Living Pro
                  </span>
                </div>
              </Link>
              <p className="text-slate-300 mb-8 max-w-md text-lg leading-relaxed">
                Your trusted companion for healthy living, nutrition wisdom, fitness guidance, 
                and wellness inspiration. Join our community on the journey to a pure, 
                balanced lifestyle.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-200 group">
                  <Facebook className="h-5 w-5 text-slate-400 group-hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-200 group">
                  <Twitter className="h-5 w-5 text-slate-400 group-hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-200 group">
                  <Instagram className="h-5 w-5 text-slate-400 group-hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-200 group">
                  <Youtube className="h-5 w-5 text-slate-400 group-hover:text-white" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/wellness-plan" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    Wellness Plan
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/sitemap.xml" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    Sitemap
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-base">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-base">
                © {new Date().getFullYear()} Pure Living Pro. All rights reserved.
              </p>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <span className="text-slate-400 text-sm">Made with</span>
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-slate-400 text-sm">for your wellness journey</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
