import { AdminNavbar } from "@/components/layout/AdminNavbar";
import {
  Bell,
  ChefHat,
  Flame,
  ShoppingBag,
  Bike,
  Coins,
  CheckCircle2,
  Clock,
} from "lucide-react";

export function RestaurantDashboardPlaceholder() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827]">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              Kitchen Display Console
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Live prep orders, ticket management, and courier handover.
            </p>
          </div>

          {/* Sound Alert Status */}
          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
            <Bell className="size-3.5 text-[#00875A]" />
            <span>Audio Chime: Active</span>
          </div>
        </div>

        {/* Kitchen Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Incoming Orders
              </span>
              <ShoppingBag className="size-4 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mt-2">
              3 Pending
            </div>
            <p className="text-xs text-amber-700 font-medium mt-1">
              Awaiting kitchen accept
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Cooking on Line
              </span>
              <Flame className="size-4 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mt-2">
              5 In Prep
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Avg prep time: 14 min
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Ready for Pickup
              </span>
              <Bike className="size-4 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mt-2">
              2 Bagged
            </div>
            <p className="text-xs text-[#00875A] font-medium mt-1">
              Couriers arriving in 3 mins
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Today's Sales
              </span>
              <Coins className="size-4 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mt-2">
              £642.80
            </div>
            <p className="text-xs text-gray-500 mt-1">
              19 fulfilled orders
            </p>
          </div>
        </div>

        {/* Kitchen Live Tickets */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ChefHat className="size-4 text-[#00875A]" />
              <h2 className="text-sm font-semibold text-gray-900">
                Live Kitchen Prep Tickets
              </h2>
            </div>
            <span className="text-xs font-medium text-gray-400">
              WebSocket Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ticket 1 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/40 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-gray-900">
                    #CH-8821
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    Pending
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-2">
                  2x Double Smash Burger, 1x Truffle Fries
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Note: No onions, extra napkins
                </p>
              </div>

              <div className="pt-3 border-t border-gray-200/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-900">£24.50</span>
                <button className="px-3 py-1.5 bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-medium rounded-md shadow-2xs transition-colors cursor-pointer">
                  Accept Order
                </button>
              </div>
            </div>

            {/* Ticket 2 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/40 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-gray-900">
                    #CH-8819
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    Cooking
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-2">
                  1x Spicy Jollof Rice Bowl, 2x Plantain
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>Timer: 8 mins remaining</span>
                </p>
              </div>

              <div className="pt-3 border-t border-gray-200/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-900">£18.00</span>
                <button className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-md shadow-2xs transition-colors cursor-pointer">
                  Mark Ready
                </button>
              </div>
            </div>

            {/* Ticket 3 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/40 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-gray-900">
                    #CH-8815
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#00875A]">
                    Bagged
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-2">
                  1x Grilled Salmon Bowl, 1x Smoothie
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Courier: Alex M. (Arriving)
                </p>
              </div>

              <div className="pt-3 border-t border-gray-200/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-900">£21.90</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#00875A]">
                  <CheckCircle2 className="size-3.5" />
                  Awaiting Handover
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
