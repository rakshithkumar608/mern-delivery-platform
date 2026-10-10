import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  LogOut,
  LayoutDashboard,
  Sliders,
  ChefHat,
  ShoppingBag,
  Search,
} from "lucide-react";
import logoImg from "@/assets/logo.png";

interface AdminNavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export function AdminNavbar({
  searchQuery,
  onSearchChange,
}: AdminNavbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    {
      label: "Overview",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      adminOnly: true,
    },
    {
      label: "Orders",
      path: "/admin/dashboard#orders",
      icon: ShoppingBag,
      adminOnly: true,
    },
    {
      label: "Delivery Rules",
      path: "/admin/settings/delivery",
      icon: Sliders,
      adminOnly: true,
    },
    {
      label: "Kitchen Console",
      path: "/restaurant/dashboard",
      icon: ChefHat,
      adminOnly: false,
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Wordmark + Portal Badge */}
          <div className="flex items-center gap-6">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <img
                src={logoImg}
                alt="Chowly"
                className="h-7 w-auto object-contain"
              />
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 rounded-md">
                Admin
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks
                .filter((link) => !link.adminOnly || user?.role === "admin")
                .map((tab) => {
                  const isActive = location.pathname === tab.path.split("#")[0];
                  return (
                    <Link
                      key={tab.label}
                      to={tab.path}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-emerald-50 text-[#00875A]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
            </nav>
          </div>

          {/* Right: Search, Status, User Info, Sign Out */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            {onSearchChange !== undefined && (
              <div className="relative hidden lg:block">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, couriers..."
                  value={searchQuery || ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-9 w-60 pl-9 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#00875A] focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* System Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 font-medium bg-gray-50 border border-gray-200 rounded-full">
              <span className="size-2 rounded-full bg-[#00875A]" />
              <span>Live Sync</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-gray-200">
              <div className="size-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-gray-900 leading-tight">
                  {user?.name ?? "Administrator"}
                </span>
                <span className="text-[11px] text-gray-500 capitalize leading-tight">
                  {user?.role?.replace("_", " ") ?? "admin"}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => void logout()}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center gap-1 pb-2.5 overflow-x-auto border-t border-gray-100 pt-2">
          {navLinks
            .filter((link) => !link.adminOnly || user?.role === "admin")
            .map((tab) => {
              const isActive = location.pathname === tab.path.split("#")[0];
              return (
                <Link
                  key={tab.label}
                  to={tab.path}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-[#00875A]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
        </div>
      </div>
    </header>
  );
}
