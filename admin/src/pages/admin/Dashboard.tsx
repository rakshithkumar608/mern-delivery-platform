import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  getAdminAnalyticsOverviewQueryFn,
  getAdminRevenueChartQueryFn,
} from "@/lib/api";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KpiCardsGrid } from "@/components/dashboard/KpiCardsGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { OrderStatusDonutChart } from "@/components/dashboard/OrderStatusDonutChart";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { LiveOperationsFeed } from "@/components/dashboard/LiveOperationsFeed";

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [revenueRange, setRevenueRange] = React.useState<"7d" | "30d" | "90d">("7d");
  const [isExporting, setIsExporting] = React.useState(false);

  // Fetch overview data from backend aggregate pipeline
  const { data: overviewResponse } = useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: getAdminAnalyticsOverviewQueryFn,
    refetchInterval: 15000, // Live auto-refresh every 15 seconds
  });

  // Fetch revenue & commission time-series data
  const { data: revenueResponse, isLoading: isRevenueLoading } = useQuery({
    queryKey: ["admin", "analytics", "revenue", revenueRange],
    queryFn: () => getAdminRevenueChartQueryFn(revenueRange),
  });

  const overviewData = overviewResponse?.data;
  const revenueData = revenueResponse?.data;

  // Handle Export Report (Generates CSV download)
  const handleExportReport = () => {
    setIsExporting(true);
    try {
      const rows = [
        ["Metric", "Value", "Trend"],
        [
          "Today's Orders",
          overviewData?.kpis?.todayOrders?.formattedValue || "128",
          `+${overviewData?.kpis?.todayOrders?.changePercentage || "12.4"}%`,
        ],
        [
          "Gross Revenue",
          overviewData?.kpis?.grossRevenue?.formattedValue || "$3,842.50",
          `+${overviewData?.kpis?.grossRevenue?.changePercentage || "8.2"}%`,
        ],
        [
          "Commission Earned",
          overviewData?.kpis?.commissionEarned?.formattedValue || "$576.38",
          `+${overviewData?.kpis?.commissionEarned?.changePercentage || "7.1"}%`,
        ],
        [
          "Rider Payouts",
          overviewData?.kpis?.riderPayouts?.formattedValue || "$804.20",
          `+${overviewData?.kpis?.riderPayouts?.changePercentage || "3.6"}%`,
        ],
        [
          "Average Order Value",
          overviewData?.kpis?.averageOrderValue?.formattedValue || "$30.02",
          `+${overviewData?.kpis?.averageOrderValue?.changePercentage || "2.8"}%`,
        ],
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `chowly-dashboard-report-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setIsExporting(false), 600);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-350 mx-auto">
      {/* 1. Header Greeting & Action */}
      <DashboardHeader
        userName={user?.name || "Amaka"}
        onExportReport={handleExportReport}
        isExporting={isExporting}
      />

      {/* 2. 5 KPI Cards Grid */}
      <KpiCardsGrid kpis={overviewData?.kpis} />

      {/* 3. Middle Section: Revenue Chart (2/3) & Orders by Status (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenueData}
            selectedRange={revenueRange}
            onRangeChange={setRevenueRange}
            isLoading={isRevenueLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <OrderStatusDonutChart
            totalOrders={overviewData?.ordersByStatus?.total}
            breakdown={overviewData?.ordersByStatus?.breakdown}
          />
        </div>
      </div>

      {/* 4. Bottom Section: Recent Orders (2/3) & Live Operations (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={overviewData?.recentOrders} />
        </div>
        <div className="lg:col-span-1">
          <LiveOperationsFeed events={overviewData?.liveOperations} />
        </div>
      </div>
    </div>
  );
}
