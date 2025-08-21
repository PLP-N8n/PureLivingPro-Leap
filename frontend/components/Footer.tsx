import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Sparkles, Heart, Mail, Phone, MapPin } from "lucide-react";
import { EmailSignupForm } from "./EmailSignupForm";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-400/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-lime-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-green-400/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-lime-400/10 rounded-full blur-2xl animate-pulse delay-3000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-400/10 rounded-full blur-xl animate-pulse delay-4000"></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-lime-400/10 rounded-full blur-xl animate-pulse delay-5000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Newsletter Signup */}
        <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl mb-20 text-center border border-white/10 shadow-2xl">
          <h2 className="text-4xl font-black text-white mb-4">Join the Wellness Circle</h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-lg">
            Get exclusive wellness tips, product recommendations, and early access to content delivered straight to your inbox.
          </p>
          <div className="flex justify-center">
            <EmailSignupForm />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-4 mb-8 group">
              <div className="relative">
                <img
                  src="/logo.svg"
                  alt="Pure Living Pro Logo"
                  className="w-14 h-14 shadow-xl"
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
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-green-600 to-lime-500 rounded-2xl flex items-center justify-center shadow-xl" style={{ display: "none" }}>
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-lime-400 to-green-400 rounded-full animate-bounce"></div>
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
                  Pure Living Pro
                </span>
                <div className="text-sm text-slate-300 font-medium">Wellness Redefined</div>
              </div>
            </Link>
            
            <p className="text-slate-300 mb-8 max-w-md text-lg leading-relaxed">
              Your ultimate wellness companion powered by AI technology. We're revolutionizing how people approach health, 
              nutrition, fitness, and mindfulness through personalized insights and expert-curated content.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="h-5 w-5 text-green-400" />
                <span>hello@purelivingpro.com</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="h-5 w-5 text-green-400" />
                <span>+1 (555) 123-PURE</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="h-5 w-5 text-green-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 bg-slate-800/80 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-110">
                <Facebook className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="#" className="w-12 h-12 bg-slate-800/80 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-110">
                <Twitter className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="#" className="w-12 h-12 bg-slate-800/80 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-110">
                <Instagram className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="#" className="w-12 h-12 bg-slate-800/80 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-110">
                <Youtube className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-black mb-8 text-white">Wellness Hub</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  Expert Articles
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  Premium Products
                </Link>
              </li>
              <li>
                <Link to="/wellness-plan" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  AI Wellness Plans
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  Personal Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-black mb-8 text-white">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/sitemap.xml" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-300 hover:text-green-400 transition-colors duration-300 text-base font-medium hover:translate-x-1 transform inline-block">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700/50 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-base">
              © {new Date().getFullYear()} Pure Living Pro. All rights reserved. Transforming lives through wellness technology.
            </p>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <span className="text-slate-400 text-sm">Crafted with</span>
              <Heart className="h-5 w-5 text-red-400 animate-pulse" />
              <span className="text-slate-400 text-sm">for your wellness journey</span>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="flex justify-center items-center gap-8 mt-8 pt-8 border-t border-slate-700/30">
            <div className="text-center">
              <div className="text-sm text-slate-400">🔒 SSL Secured</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">🏆 Award Winning</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">⚡ AI Powered</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">🌱 Eco Friendly</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
