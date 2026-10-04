import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { OrderStatus } from "@/lib/api";

const BRAND_TEAL = "#007A5A";

export interface StepperStep {
  id: string;
  label: string;
  time?: string;
  statusMatch: OrderStatus[];
}

export const ORDER_STEPS: StepperStep[] = [
  {
    id: "confirmed",
    label: "Confirmed",
    time: "",
    statusMatch: ["placed", "accepted"],
  },
  {
    id: "preparing",
    label: "Preparing",
    time: "",
    statusMatch: ["preparing", "ready"],
  },
  {
    id: "picked_up",
    label: "Picked up",
    time: "",
    statusMatch: ["picked_up"],
  },
  {
    id: "on_the_way",
    label: "On the way",
    time: "",
    statusMatch: ["on_the_way"],
  },
  {
    id: "delivered",
    label: "Delivered",
    time: "",
    statusMatch: ["delivered"],
  },
];

interface OrderStepperProps {
  currentStatus?: OrderStatus | string;
  customActiveIndex?: number;
  stepTimes?: { [key: string]: string };
}

export function OrderStepper({
  currentStatus = "placed",
  customActiveIndex,
  stepTimes,
}: OrderStepperProps) {
  // Determine active step index (0 to 4)
  const activeIndex = React.useMemo(() => {
    if (typeof customActiveIndex === "number") {
      return customActiveIndex;
    }
    switch (currentStatus) {
      case "placed":
      case "accepted":
        return 0;
      case "preparing":
      case "ready":
        return 1;
      case "picked_up":
        return 2;
      case "on_the_way":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0;
    }
  }, [currentStatus, customActiveIndex]);

  return (
    <View className="w-full py-2">
      {/* ── Circles and Connecting Lines Row ── */}
      <View className="flex-row items-center justify-between px-2">
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isPending = index > activeIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Connector line before this circle (starting from step 1) */}
              {index > 0 && (
                <View className="flex-1 mx-1.5 items-center justify-center">
                  {index <= activeIndex ? (
                    // Solid teal line
                    <View
                      style={{
                        height: 2,
                        width: "100%",
                        backgroundColor: BRAND_TEAL,
                      }}
                    />
                  ) : (
                    // Dashed line for pending stages
                    <Svg height="2" width="100%">
                      <Line
                        x1="0"
                        y1="1"
                        x2="100%"
                        y2="1"
                        stroke="#CBD5E1"
                        strokeWidth="2"
                        strokeDasharray="4, 3"
                      />
                    </Svg>
                  )}
                </View>
              )}

              {/* Circle indicator */}
              <View className="items-center justify-center">
                {isCompleted && (
                  <View
                    className="h-8 w-8 rounded-full items-center justify-center shadow-xs"
                    style={{ backgroundColor: BRAND_TEAL }}
                  >
                    <Feather name="check" size={15} color="#FFFFFF" />
                  </View>
                )}

                {isActive && (
                  <View
                    className="h-8 w-8 rounded-full items-center justify-center bg-white dark:bg-card"
                    style={{
                      borderWidth: 2,
                      borderColor: BRAND_TEAL,
                    }}
                  >
                    {step.id === "picked_up" ? (
                      <Feather name="shopping-bag" size={14} color={BRAND_TEAL} />
                    ) : step.id === "preparing" ? (
                      <MaterialCommunityIcons
                        name="silverware-fork-knife"
                        size={14}
                        color={BRAND_TEAL}
                      />
                    ) : step.id === "on_the_way" || step.id === "nearby" ? (
                      <MaterialCommunityIcons
                        name="moped"
                        size={15}
                        color={BRAND_TEAL}
                      />
                    ) : (
                      <Feather name="check" size={14} color={BRAND_TEAL} />
                    )}
                  </View>
                )}

                {isPending && (
                  <View
                    className="h-8 w-8 rounded-full items-center justify-center"
                    style={{
                      borderWidth: 1.5,
                      borderColor: "#CBD5E1",
                      borderStyle: "dashed",
                      backgroundColor: "transparent",
                    }}
                  />
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {/* ── Labels and Times Row ── */}
      <View className="flex-row justify-between mt-2">
        {ORDER_STEPS.map((step, index) => {
          const isPassedOrActive = index <= activeIndex;
          const displayTime =
            stepTimes?.[step.id] ?? (isPassedOrActive ? step.time : "");

          return (
            <View
              key={`label-${step.id}`}
              className="items-center"
              style={{ width: "20%" }}
            >
              <Text
                className={`text-[11px] text-center font-medium ${
                  isPassedOrActive
                    ? "font-bold text-foreground"
                    : "text-muted-foreground"
                }`}
                numberOfLines={1}
              >
                {step.label}
              </Text>
              {Boolean(displayTime) && (
                <Text className="text-[10px] text-muted-foreground text-center mt-0.5">
                  {displayTime}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
