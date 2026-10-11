import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "cn";

export interface RevenuePoint {
  day: string;
  date: string;
  revenue: number;
  commission: number;
}

interface RevenueChartProps {
  data?: RevenuePoint[];
  selectedRange?: "7d" | "30d" | "90d";
  onRangeChange?: (range: "7d" | "30d" | "90d") => void;
  isLoading?: boolean;
}

export function RevenueChart({
  data,
  selectedRange = "7d",
  onRangeChange,
  isLoading = false,
}: RevenueChartProps) {
  // Default 7-day baseline directly matching the design reference curve
  const defaultData: RevenuePoint[] = [
    { day: "Mon", date: "2026-09-02", revenue: 2580, commission: 890 },
    { day: "Tue", date: "2026-09-03", revenue: 3340, commission: 1140 },
    { day: "Wed", date: "2026-09-04", revenue: 3050, commission: 1020 },
    { day: "Thu", date: "2026-09-05", revenue: 3620, commission: 1250 },
    { day: "Fri", date: "2026-09-06", revenue: 3950, commission: 1380 },
    { day: "Sat", date: "2026-09-07", revenue: 4120, commission: 1490 },
    { day: "Sun", date: "2026-09-08", revenue: 3740, commission: 1320 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const rev = payload.find((p: any) => p.dataKey === "revenue")?.value || 0;
      const comm = payload.find((p: any) => p.dataKey === "commission")?.value || 0;

      return (
        <div className="bg-[#1F2937] text-white text-xs rounded-lg py-1.5 px-3 shadow-lg flex flex-col gap-1 border border-gray-700">
          <div className="font-semibold text-sm text-[#34D399]">
            ${rev.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-300">
            Commission: <span className="text-[#FB923C] font-medium">${comm.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      {/* Header and Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">
            Revenue overview
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Gross revenue and commission
          </p>
        </div>

        {/* 7 days, 30 days, 90 days Pills */}
        <div className="inline-flex items-center p-1 bg-gray-50 border border-gray-100 rounded-xl self-start sm:self-auto">
          {(
            [
              { id: "7d", label: "7 days" },
              { id: "30d", label: "30 days" },
              { id: "90d", label: "90 days" },
            ] as const
          ).map((tab) => {
            const isActive = selectedRange === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onRangeChange?.(tab.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                  isActive
                    ? "bg-[#00875A] text-white shadow-2xs font-semibold"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10 text-xs text-gray-400">
            Loading chart data...
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {/* Teal Revenue Gradient */}
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00875A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00875A" stopOpacity={0.0} />
              </linearGradient>

              {/* Coral Commission Gradient */}
              <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F3F4F6"
            />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: "#F3F4F6" }}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              dy={10}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
              domain={[0, "auto"]}
              dx={-5}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Revenue Area (Teal) */}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#00875A"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
              activeDot={{
                r: 6,
                fill: "#00875A",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              dot={{
                r: 3.5,
                fill: "#00875A",
                stroke: "#FFFFFF",
                strokeWidth: 1.5,
              }}
            />

            {/* Commission Area (Coral) */}
            <Area
              type="monotone"
              dataKey="commission"
              stroke="#F97316"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#commissionGradient)"
              activeDot={{
                r: 5,
                fill: "#F97316",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              dot={{
                r: 3.5,
                fill: "#F97316",
                stroke: "#FFFFFF",
                strokeWidth: 1.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend below chart */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-50 text-xs font-medium text-gray-600">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#00875A]" />
          <span>Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#F97316]" />
          <span>Commission</span>
        </div>
      </div>
    </div>
  );
}
