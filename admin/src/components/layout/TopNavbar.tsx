import * as React from "react";
import { Search, Calendar, ChevronDown, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavbarProps {
  breadcrumbs?: string[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  selectedDateRange?: string;
  onDateRangeChange?: (range: string) => void;
}

export function TopNavbar({
  breadcrumbs = ["Admin", "Overview"],
  searchQuery = "",
  onSearchChange,
  selectedDateRange = "Today, 8 Sep 2026",
  onDateRangeChange,
}: TopNavbarProps) {
  const [unreadNotifications, _setUnreadNotifications] = React.useState(3);

  // Format today's date dynamically if needed
  const formattedToday = React.useMemo(() => {
    const d = new Date();
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `Today, ${day} ${month} ${year}`;
  }, []);

  const displayDate = selectedDateRange || formattedToday;

  return (
    <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Sidebar Trigger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-gray-500 hover:text-gray-900 md:hidden" />

        <nav className="flex items-center gap-2 text-sm text-gray-500">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={item}>
                {index > 0 && <span className="text-gray-300">/</span>}
                <span
                  className={
                    isLast
                      ? "font-semibold text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }
                >
                  {item}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, Date Filter, Notification Bell */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72 lg:w-96">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search orders, restaurants or customers"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs bg-gray-50/80 hover:bg-gray-100/60 focus:bg-white border border-gray-200/80 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875A]/20 focus:border-[#00875A] transition-all"
          />
        </div>

        {/* Date Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 h-10 px-3.5 bg-white border border-gray-200/90 hover:bg-gray-50 rounded-xl text-xs font-medium text-gray-700 shadow-2xs transition-colors cursor-pointer shrink-0 outline-none">
            <Calendar className="size-3.5 text-gray-500" />
            <span>{displayDate}</span>
            <ChevronDown className="size-3.5 text-gray-400 ml-0.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-xs">
            <DropdownMenuItem onClick={() => onDateRangeChange?.(formattedToday)}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateRangeChange?.("Yesterday")}>
              Yesterday
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateRangeChange?.("Last 7 days")}>
              Last 7 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateRangeChange?.("Last 30 days")}>
              Last 30 days
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification Bell */}
        <button
          title="Notifications"
          className="relative size-10 flex items-center justify-center rounded-xl border border-gray-200/90 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer shrink-0"
        >
          <Bell className="size-4" />
          {unreadNotifications > 0 && (
            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
}
