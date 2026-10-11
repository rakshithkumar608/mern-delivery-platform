import * as React from "react";
import { Link } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  restaurantName: string;
  total: number;
  formattedTotal: string;
  status: string;
  statusLabel: string;
  time: string;
}

interface RecentOrdersTableProps {
  orders?: RecentOrder[];
  isLoading?: boolean;
}

export function RecentOrdersTable({
  orders,
  isLoading = false,
}: RecentOrdersTableProps) {
  // Fallback sample data matching the exact rows in dashboard-screen.png
  const defaultOrders: RecentOrder[] = [
    {
      id: "ord_1",
      orderNumber: "#CH-2514",
      customerName: "Maya Chen",
      restaurantName: "Mama Chow's Kitchen",
      total: 24.8,
      formattedTotal: "$24.80",
      status: "preparing",
      statusLabel: "Preparing",
      time: "10:42",
    },
    {
      id: "ord_2",
      orderNumber: "#CH-2513",
      customerName: "Liam Brooks",
      restaurantName: "Bosco Pizza Co.",
      total: 31.2,
      formattedTotal: "$31.20",
      status: "ready",
      statusLabel: "Ready",
      time: "10:38",
    },
    {
      id: "ord_3",
      orderNumber: "#CH-2512",
      customerName: "Sofia Patel",
      restaurantName: "Green Bowl",
      total: 18.75,
      formattedTotal: "$18.75",
      status: "on_the_way",
      statusLabel: "On the way",
      time: "10:31",
    },
    {
      id: "ord_4",
      orderNumber: "#CH-2511",
      customerName: "Noah Williams",
      restaurantName: "Suya Republic",
      total: 27.4,
      formattedTotal: "$27.40",
      status: "confirmed",
      statusLabel: "Confirmed",
      time: "10:25",
    },
  ];

  const data = orders && orders.length > 0 ? orders : defaultOrders;

  // Status Badge Helper matching design pills with dot
  const renderStatusBadge = (status: string, label: string) => {
    switch (status.toLowerCase()) {
      case "preparing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF3C7] text-[#92400E]">
            <span className="size-1.5 rounded-full bg-[#D97706]" />
            {label}
          </span>
        );
      case "ready":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#166534]">
            <span className="size-1.5 rounded-full bg-[#16A34A]" />
            {label}
          </span>
        );
      case "on_the_way":
      case "picked_up":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFEDD5] text-[#9A3412]">
            <span className="size-1.5 rounded-full bg-[#EA580C]" />
            {label}
          </span>
        );
      case "confirmed":
      case "placed":
      case "accepted":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E6F7F0] text-[#00875A]">
            <span className="size-1.5 rounded-full bg-[#00875A]" />
            {label}
          </span>
        );
    }
  };

  const columns: ColumnDef<RecentOrder, any>[] = React.useMemo(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order",
        cell: ({ row }) => (
          <span className="font-semibold text-gray-900 text-xs tracking-tight">
            {row.original.orderNumber}
          </span>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <span className="text-gray-900 font-medium">
            {row.original.customerName}
          </span>
        ),
      },
      {
        accessorKey: "restaurantName",
        header: "Restaurant",
        cell: ({ row }) => (
          <span className="text-gray-600">
            {row.original.restaurantName}
          </span>
        ),
      },
      {
        accessorKey: "formattedTotal",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-semibold text-gray-900">
            {row.original.formattedTotal}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) =>
          renderStatusBadge(row.original.status, row.original.statusLabel),
      },
      {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => (
          <span className="text-gray-500 font-mono text-[11px]">
            {row.original.time}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      {/* Table Header with View All link */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-50">
        <div>
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">
            Recent orders
          </h2>
        </div>

        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#00875A] hover:text-[#00704A] transition-colors"
        >
          <span>View all orders</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* TanStack Table Instance */}
      <div className="mt-2">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          emptyMessage="No recent orders found."
        />
      </div>
    </div>
  );
}
