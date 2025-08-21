import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Newspaper,
  ShoppingBag,
  Bot,
  Settings,
  LineChart,
  LifeBuoy,
} from "lucide-react";
import { SEOHead } from "../components/SEOHead";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { OverviewDashboard } from "../components/admin/OverviewDashboard";
import { BlogManagement } from "../components/admin/BlogManagement";
import { ProductManagement } from "../components/admin/ProductManagement";
import { AutomationDashboard } from "../components/admin/AutomationDashboard";
import { SettingsDashboard } from "../components/admin/SettingsDashboard";
import { useAnalytics } from "../hooks/useAnalytics";

const navItems = [
  { name: "Overview", href: "overview", icon: LayoutDashboard },
  { name: "Blog", href: "blog", icon: Newspaper },
  { name: "Products", href: "products", icon: ShoppingBag },
  { name: "Automation", href: "automation", icon: Bot },
  { name: "Analytics", href: "analytics", icon: LineChart },
  { name: "Settings", href: "settings", icon: Settings },
];

export function AdminPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Track page view with error handling
    trackPageView(`/admin?tab=${activeTab}`);
  }, [activeTab, trackPageView]);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewDashboard />;
      case "blog":
        return <BlogManagement />;
      case "products":
        return <ProductManagement />;
      case "automation":
        return <AutomationDashboard />;
      case "settings":
        return <SettingsDashboard />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <>
      <SEOHead title="Admin Dashboard" />
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={`?tab=${item.href}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      activeTab === item.href
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <Link
                to="/help"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LifeBuoy className="h-5 w-5" />
                Help & Support
              </Link>
            </div>
          </aside>

          {/* Main Panel */}
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
