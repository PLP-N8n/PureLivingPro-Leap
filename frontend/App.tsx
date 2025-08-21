import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AIAssistant } from "./components/AIAssistant";
import { HomePage } from "./pages/HomePage";
import { BlogPage } from "./pages/BlogPage";
import { ArticlePage } from "./pages/ArticlePage";
import { CategoryPage } from "./pages/CategoryPage";
import { SearchPage } from "./pages/SearchPage";
import { ProductsPage } from "./pages/ProductsPage";
import { WellnessPlanPage } from "./pages/WellnessPlanPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 flex flex-col font-inter relative overflow-hidden">
            {/* Animated background elements */}
            <div className="fixed inset-0 -z-10">
              <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-200/20 to-lime-200/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-lime-200/10 to-green-200/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            
            <Header />
            <main className="flex-1 relative z-10">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:category" element={<ProductsPage />} />
                <Route path="/wellness-plan" element={<WellnessPlanPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
            <AIAssistant />
            <Toaster />
          </div>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
