import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  FileText,
  UtensilsCrossed,
  LayoutGrid,
  Users,
  Bike,
  Image as ImageIcon,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "cn";

interface AppSidebarProps {
  ordersCount?: number;
}

export function AppSidebar({ ordersCount = 12 }: AppSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    {
      title: "Overview",
      url: "/admin/dashboard",
      icon: Home,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: FileText,
      badge: ordersCount,
    },
    {
      title: "Restaurants",
      url: "/admin/restaurants",
      icon: UtensilsCrossed,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: LayoutGrid,
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: Users,
    },
    {
      title: "Riders",
      url: "/admin/riders",
      icon: Bike,
    },
    {
      title: "Banners",
      url: "/admin/banners",
      icon: ImageIcon,
    },
    {
      title: "Settings",
      url: "/admin/settings/delivery",
      icon: Settings,
    },
  ];

  const adminName = user?.name || "Amaka Obi";
  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AO";

  return (
    <Sidebar className="border-r border-gray-100 bg-[#FBFDFB]">
      {/* Brand Header */}
      <SidebarHeader className="h-16 px-6 flex justify-center border-b border-gray-100/60">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Chowly"
            className="h-8 w-auto object-contain"
          />
        </Link>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-2">
            ADMIN
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item) => {
                const isActive =
                  item.url === "/admin/dashboard"
                    ? location.pathname === "/admin/dashboard" || location.pathname === "/admin"
                    : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className={cn(
                        "h-11 px-3.5 rounded-xl font-medium text-sm transition-all duration-150",
                        isActive
                          ? "bg-[#E6F7F0] text-[#00875A] font-semibold hover:bg-[#DDF3EA] hover:text-[#00704A]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                      )}
                      render={
                        <Link to={item.url} className="flex items-center gap-3.5 w-full">
                          <item.icon
                            className={cn(
                              "size-[18px] shrink-0 transition-colors",
                              isActive ? "text-[#00875A]" : "text-gray-500"
                            )}
                          />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      }
                    />

                    {item.badge !== undefined && item.badge > 0 && (
                      <SidebarMenuBadge className="bg-[#FF5C38] text-white text-[11px] font-bold px-2 py-0.5 rounded-full right-3 pointer-events-none">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer Profile Card */}
      <SidebarFooter className="p-3 border-t border-gray-100/60">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-gray-100/80 transition-colors cursor-pointer text-left outline-none">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-full bg-[#E6F4EA] border border-[#C2E8D7] flex items-center justify-center text-xs font-semibold text-[#00875A] shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-semibold text-gray-900 truncate leading-tight">
                  {adminName}
                </span>
                <span className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                  Administrator
                </span>
              </div>
            </div>
            <ChevronDown className="size-4 text-gray-400 shrink-0 ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              render={
                <Link to="/admin/settings/delivery" className="flex items-center w-full cursor-pointer">
                  <Settings className="size-4 mr-2" />
                  Platform Settings
                </Link>
              }
            />
            <DropdownMenuItem
              onClick={() => void logout()}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="size-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
