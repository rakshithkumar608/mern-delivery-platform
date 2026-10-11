import { Link } from "react-router-dom";
import { Package, Bike, Utensils, UserPlus, ArrowRight } from "lucide-react";

export interface LiveOperationItem {
  id: string;
  type: "ready" | "claimed" | "accepted" | "application" | "general";
  title: string;
  timeAgo: string;
}

interface LiveOperationsFeedProps {
  events?: LiveOperationItem[];
}

export function LiveOperationsFeed({ events }: LiveOperationsFeedProps) {
  // Default values matching the design reference exactly
  const defaultEvents: LiveOperationItem[] = [
    {
      id: "ev_1",
      type: "ready",
      title: "Order #CH-2513 is ready for pickup",
      timeAgo: "2 min",
    },
    {
      id: "ev_2",
      type: "claimed",
      title: "Tunde A. claimed order #CH-2512",
      timeAgo: "6 min",
    },
    {
      id: "ev_3",
      type: "accepted",
      title: "Mama Chow's Kitchen accepted #CH-2514",
      timeAgo: "9 min",
    },
    {
      id: "ev_4",
      type: "application",
      title: "New restaurant application received",
      timeAgo: "18 min",
    },
  ];

  const data = events && events.length > 0 ? events : defaultEvents;

  const renderIcon = (type: LiveOperationItem["type"]) => {
    switch (type) {
      case "ready":
        return <Package className="size-4 text-[#00875A]" />;
      case "claimed":
        return <Bike className="size-4 text-[#00875A]" />;
      case "accepted":
        return <Utensils className="size-4 text-[#00875A]" />;
      case "application":
      default:
        return <UserPlus className="size-4 text-[#00875A]" />;
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      {/* Header with live pulsating green dot */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-50">
        <h2 className="text-base font-semibold text-gray-900 tracking-tight">
          Live operations
        </h2>

        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00875A] opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-[#00875A]" />
          </span>
          <span className="text-[11px] text-gray-500">Updating live</span>
        </div>
      </div>

      {/* Activity Timeline Items */}
      <div className="divide-y divide-gray-50/80 my-2">
        {data.map((item) => (
          <div
            key={item.id}
            className="py-3.5 first:pt-2 last:pb-2 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-[#E8F8F0] flex items-center justify-center shrink-0">
                {renderIcon(item.type)}
              </div>
              <span className="text-xs font-medium text-gray-900 truncate">
                {item.title}
              </span>
            </div>

            <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
              {item.timeAgo}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-gray-50">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#00875A] hover:text-[#00704A] transition-colors"
        >
          <span>Open live orders</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
