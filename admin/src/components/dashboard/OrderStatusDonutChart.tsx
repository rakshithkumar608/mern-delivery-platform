import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface StatusItem {
  status: string;
  label: string;
  count: number;
  color: string;
}

interface OrderStatusDonutChartProps {
  totalOrders?: number;
  breakdown?: StatusItem[];
}

export function OrderStatusDonutChart({
  totalOrders = 128,
  breakdown,
}: OrderStatusDonutChartProps) {
  // Default values matching the design reference exactly
  const defaultBreakdown: StatusItem[] = [
    { status: "confirmed", label: "Confirmed", count: 34, color: "#006C4C" },
    { status: "preparing", label: "Preparing", count: 28, color: "#48BB78" },
    { status: "ready", label: "Ready", count: 19, color: "#F59E0B" },
    { status: "on_the_way", label: "On the way", count: 31, color: "#F97316" },
    { status: "delivered", label: "Delivered", count: 16, color: "#CBD5E1" },
  ];

  const data = breakdown && breakdown.length > 0 ? breakdown : defaultBreakdown;
  const computedTotal = breakdown
    ? breakdown.reduce((sum, item) => sum + item.count, 0)
    : totalOrders;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <h2 className="text-base font-semibold text-gray-900 tracking-tight">
          Orders by status
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto py-2">
        {/* Donut Chart with Centered Total */}
        <div className="relative size-44 sm:size-48 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={78}
                paddingAngle={3}
                dataKey="count"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
              {computedTotal}
            </span>
            <span className="text-xs text-gray-400 font-normal mt-1">
              Orders
            </span>
          </div>
        </div>

        {/* Legend / Status breakdown list */}
        <div className="flex-1 w-full flex flex-col gap-3 min-w-[140px]">
          {data.map((item) => (
            <div
              key={item.status}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 font-medium">{item.label}</span>
              </div>
              <span className="font-semibold text-gray-900">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
        <span>Active status pipeline</span>
        <span>Realtime updates</span>
      </div>
    </div>
  );
}
