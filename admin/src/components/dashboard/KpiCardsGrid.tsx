import { ShoppingCart, BarChart3, Coins, Bike, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";

export interface KpiData {
  todayOrders: {
    formattedValue: string;
    changePercentage: number;
    isPositive: boolean;
    comparisonText: string;
  };
  grossRevenue: {
    formattedValue: string;
    changePercentage: number;
    isPositive: boolean;
    comparisonText: string;
  };
  commissionEarned: {
    formattedValue: string;
    changePercentage: number;
    isPositive: boolean;
    comparisonText: string;
  };
  riderPayouts: {
    formattedValue: string;
    changePercentage: number;
    isPositive: boolean;
    comparisonText: string;
  };
  averageOrderValue: {
    formattedValue: string;
    changePercentage: number;
    isPositive: boolean;
    comparisonText: string;
  };
}

interface KpiCardsGridProps {
  kpis?: KpiData;
}

export function KpiCardsGrid({ kpis }: KpiCardsGridProps) {
  // Default values directly matching the design reference if not yet loaded
  const defaultKpis: KpiData = {
    todayOrders: {
      formattedValue: "128",
      changePercentage: 12.4,
      isPositive: true,
      comparisonText: "vs yesterday",
    },
    grossRevenue: {
      formattedValue: "$3,842.50",
      changePercentage: 8.2,
      isPositive: true,
      comparisonText: "vs yesterday",
    },
    commissionEarned: {
      formattedValue: "$576.38",
      changePercentage: 7.1,
      isPositive: true,
      comparisonText: "vs yesterday",
    },
    riderPayouts: {
      formattedValue: "$804.20",
      changePercentage: 3.6,
      isPositive: true,
      comparisonText: "vs yesterday",
    },
    averageOrderValue: {
      formattedValue: "$30.02",
      changePercentage: 2.8,
      isPositive: true,
      comparisonText: "vs yesterday",
    },
  };

  const data = kpis || defaultKpis;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KpiCard
        title="Today's orders"
        value={data.todayOrders.formattedValue}
        icon={ShoppingCart}
        changePercentage={data.todayOrders.changePercentage}
        isPositive={data.todayOrders.isPositive}
        comparisonText={data.todayOrders.comparisonText}
      />
      <KpiCard
        title="Gross revenue"
        value={data.grossRevenue.formattedValue}
        icon={BarChart3}
        changePercentage={data.grossRevenue.changePercentage}
        isPositive={data.grossRevenue.isPositive}
        comparisonText={data.grossRevenue.comparisonText}
      />
      <KpiCard
        title="Commission earned"
        value={data.commissionEarned.formattedValue}
        icon={Coins}
        changePercentage={data.commissionEarned.changePercentage}
        isPositive={data.commissionEarned.isPositive}
        comparisonText={data.commissionEarned.comparisonText}
      />
      <KpiCard
        title="Rider payouts"
        value={data.riderPayouts.formattedValue}
        icon={Bike}
        changePercentage={data.riderPayouts.changePercentage}
        isPositive={data.riderPayouts.isPositive}
        comparisonText={data.riderPayouts.comparisonText}
      />
      <KpiCard
        title="Average order value"
        value={data.averageOrderValue.formattedValue}
        icon={TrendingUp}
        changePercentage={data.averageOrderValue.changePercentage}
        isPositive={data.averageOrderValue.isPositive}
        comparisonText={data.averageOrderValue.comparisonText}
      />
    </div>
  );
}
