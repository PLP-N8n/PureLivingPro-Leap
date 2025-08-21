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
import { AboutPage } from "./pages/AboutPage";
import { UIPage } from "./pages/UIPage";
import { MotionProvider } from "./providers/MotionProvider";
import "./styles/globals.css";

const queryClient = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MotionProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
              <Header />
              <main className="flex-1">
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
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/ui" element={<UIPage />} />
                </Routes>
              </main>
              <Footer />
              <AIAssistant />
              <Toaster />
            </div>
          </Router>
        </MotionProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
