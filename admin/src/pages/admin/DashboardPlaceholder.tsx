import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import {
  Bike,
  Clock,
  Coins,
  ChevronRight,
  Percent,
  ShoppingBag,
  Sliders,
  TrendingUp,
} from "lucide-react";

interface MockOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  restaurantName: string;
  itemsSummary: string;
  totalPrice: number;
  currency: string;
  status: "placed" | "preparing" | "on_the_way" | "delivered";
  statusLabel: string;
  eta: string;
  image: string;
  driverName?: string;
}

interface MockDriver {
  id: string;
  name: string;
  vehicle: string;
  status: "delivering" | "available";
  activeOrder?: string;
  todayEarnings: number;
  todayDeliveries: number;
  rating: number;
}

export function AdminDashboardPlaceholder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("all");

  const mockOrders: MockOrder[] = [
    {
      id: "ord_101",
      orderNumber: "CH-2048",
      customerName: "Sophia Martinez",
      restaurantName: "Burger & Beyond",
      itemsSummary: "1x Bougie Burger with Truffle Mayo, 1x Rosemary Salt Fries",
      totalPrice: 16.45,
      currency: "£",
      status: "on_the_way",
      statusLabel: "On the way",
      eta: "8–12 min",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80",
      driverName: "Tunde A. (Scooter)",
    },
    {
      id: "ord_102",
      orderNumber: "CH-2047",
      customerName: "Liam Johnson",
      restaurantName: "Sushi Daily",
      itemsSummary: "1x Rainbow Sushi Platter (12 pcs), 1x Miso Soup",
      totalPrice: 19.8,
      currency: "£",
      status: "preparing",
      statusLabel: "Preparing",
      eta: "14–18 min",
      image:
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&auto=format&fit=crop&q=80",
      driverName: "Alex M. (Assigned)",
    },
    {
      id: "ord_103",
      orderNumber: "CH-2046",
      customerName: "Emma Davies",
      restaurantName: "Bella Italia",
      itemsSummary: "2x Margherita DOP, 1x Garlic Dough Balls",
      totalPrice: 24.5,
      currency: "£",
      status: "placed",
      statusLabel: "Order Placed",
      eta: "25–30 min",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format&fit=crop&q=80",
    },
    {
      id: "ord_104",
      orderNumber: "CH-2045",
      customerName: "David Kim",
      restaurantName: "Pasta Evangelists",
      itemsSummary: "1x Truffle Tagliatelle, 1x Tiramisu Cup",
      totalPrice: 15.3,
      currency: "£",
      status: "delivered",
      statusLabel: "Delivered",
      eta: "Delivered 15m ago",
      image:
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&auto=format&fit=crop&q=80",
      driverName: "Sarah K. (E-Bike)",
    },
  ];

  const mockDrivers: MockDriver[] = [
    {
      id: "drv_1",
      name: "Tunde A.",
      vehicle: "Scooter",
      status: "delivering",
      activeOrder: "CH-2048",
      todayEarnings: 48.6,
      todayDeliveries: 7,
      rating: 4.9,
    },
    {
      id: "drv_2",
      name: "Alex M.",
      vehicle: "E-Bike",
      status: "delivering",
      activeOrder: "CH-2047",
      todayEarnings: 39.2,
      todayDeliveries: 5,
      rating: 4.8,
    },
    {
      id: "drv_3",
      name: "Sarah K.",
      vehicle: "E-Bike",
      status: "available",
      todayEarnings: 54.0,
      todayDeliveries: 8,
      rating: 5.0,
    },
    {
      id: "drv_4",
      name: "Marcus B.",
      vehicle: "Bicycle",
      status: "available",
      todayEarnings: 31.5,
      todayDeliveries: 4,
      rating: 4.7,
    },
  ];

  const filteredOrders = mockOrders.filter((order) => {
    if (orderFilter !== "all" && order.status !== orderFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.restaurantName.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827]">
      <AdminNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              Operations Overview
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Live orders, courier fleet status, and delivery pricing control.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/settings/delivery"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00875A] hover:bg-[#00704A] text-white text-xs sm:text-sm font-medium rounded-lg shadow-xs transition-colors"
            >
              <Sliders className="size-4" />
              <span>Delivery Rules</span>
            </Link>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Volume */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Gross Volume
              </span>
              <Coins className="size-4 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mt-2">
              £1,428.50
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#00875A] font-medium mt-1.5">
              <TrendingUp className="size-3.5" />
              <span>+14.2%</span>
              <span className="text-gray-400 font-normal">vs yesterday</span>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Active Orders
              </span>
              <ShoppingBag className="size-4 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mt-2">
              18
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              9 in kitchen • 5 in transit
            </p>
          </div>

          {/* Couriers */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Couriers Online
              </span>
              <Bike className="size-4 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mt-2">
              24
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              16 available • 8 on delivery
            </p>
          </div>

          {/* Commission */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Commission (15%)
              </span>
              <Percent className="size-4 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mt-2">
              £214.28
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Platform retained share
            </p>
          </div>
        </div>

        {/* Live Orders Section (Exact Mobile Orders Screen Reference) */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Live Orders
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Current order lifecycle across restaurants and customers
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 self-start sm:self-auto">
              {[
                { id: "all", label: "All" },
                { id: "placed", label: "Placed" },
                { id: "preparing", label: "Cooking" },
                { id: "on_the_way", label: "On the way" },
                { id: "delivered", label: "Delivered" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderFilter(tab.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    orderFilter === tab.id
                      ? "bg-white text-gray-900 shadow-2xs font-semibold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {/* Food Thumbnail */}
                  <img
                    src={order.image}
                    alt={order.restaurantName}
                    className="size-14 rounded-lg object-cover shrink-0 border border-gray-100"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {order.restaurantName}
                      </h3>
                      <span className="text-xs font-mono text-gray-400">
                        {order.orderNumber}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 truncate max-w-md mt-0.5">
                      {order.itemsSummary}
                    </p>

                    <div className="flex items-center gap-3 text-xs mt-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          order.status === "on_the_way"
                            ? "bg-emerald-50 text-[#00875A]"
                            : order.status === "preparing"
                            ? "bg-amber-50 text-amber-700"
                            : order.status === "placed"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.statusLabel}
                      </span>

                      <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                        <Clock className="size-3" />
                        {order.eta}
                      </span>

                      {order.driverName && (
                        <span className="text-gray-400 text-[11px] hidden md:inline">
                          Courier: {order.driverName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-5 pl-18 sm:pl-0">
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {order.currency}
                      {order.totalPrice.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-gray-400 block">
                      {order.customerName}
                    </span>
                  </div>

                  <button className="text-xs font-medium text-[#00875A] hover:text-[#006644] hover:underline flex items-center gap-0.5 cursor-pointer whitespace-nowrap">
                    <span>Details</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Courier Fleet & Delivery Rules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Couriers Column */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Active Courier Fleet
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time rider assignment and earnings
                </p>
              </div>
              <span className="text-xs font-medium text-[#00875A] bg-emerald-50 px-2.5 py-1 rounded-full">
                24 Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="border border-gray-100 rounded-lg p-3.5 bg-gray-50/50 flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                        {driver.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-900 block leading-tight">
                          {driver.name}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {driver.vehicle} • ★ {driver.rating}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        driver.status === "delivering"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-[#00875A]"
                      }`}
                    >
                      {driver.status === "delivering" ? "In Transit" : "Available"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60">
                    <span className="text-gray-500 text-[11px]">
                      {driver.todayDeliveries} orders today
                    </span>
                    <span className="font-semibold text-gray-900">
                      £{driver.todayEarnings.toFixed(2)} earned
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Pricing Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">
                  Delivery Pricing Rules
                </h3>
                <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  v1.0 Live
                </span>
              </div>

              <div className="divide-y divide-gray-100 text-xs mt-2">
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500">Courier Base Pay</span>
                  <span className="font-semibold text-gray-900">£4.90</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500">Distance Rate</span>
                  <span className="font-semibold text-gray-900">£1.20 / km</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500">Platform Commission</span>
                  <span className="font-semibold text-[#00875A]">15%</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500">Minimum Floor</span>
                  <span className="font-semibold text-gray-900">£5.00</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500">Customer Delivery Fee</span>
                  <span className="font-semibold text-gray-900">£1.49</span>
                </div>
              </div>
            </div>

            <Link
              to="/admin/settings/delivery"
              className="w-full text-center py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Configure Delivery Rules & Rates
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
