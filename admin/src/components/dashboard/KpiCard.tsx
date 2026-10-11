import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "cn";

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  changePercentage: number;
  isPositive?: boolean;
  comparisonText?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  changePercentage,
  isPositive = true,
  comparisonText = "vs yesterday",
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between gap-3",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="size-11 rounded-xl bg-[#E8F8F0] text-[#00875A] flex items-center justify-center shrink-0">
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs font-normal text-gray-500">{title}</span>
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight">
          {value}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium mt-1">
          <span
            className={cn(
              "flex items-center gap-0.5",
              isPositive ? "text-[#00875A]" : "text-rose-600"
            )}
          >
            {isPositive ? (
              <ArrowUp className="size-3.5 stroke-[2.5]" />
            ) : (
              <ArrowDown className="size-3.5 stroke-[2.5]" />
            )}
            <span>
              {isPositive ? "+" : "-"}
              {changePercentage}%
            </span>
          </span>
          <span className="text-gray-400 font-normal">{comparisonText}</span>
        </div>
      </div>
    </div>
  );
}
