import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useUniwind } from "uniwind";

import { toast } from "@/lib/sonner";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  isDefault?: boolean;
}

interface AddressBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string, label: string, address: string) => void;
}

const SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: "home",
    label: "Home",
    address: "123 Main Street, Apt 4B",
    isDefault: true,
  },
  {
    id: "work",
    label: "Work",
    address: "456 Business Ave, Floor 3",
  },
];

export function AddressBottomSheet({
  visible,
  onClose,
  selectedId,
  onSelect,
}: AddressBottomSheetProps) {
  const { theme } = useUniwind();
  const isDark = theme === "dark";
  const router = useRouter();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <View className="flex-1" />
      </Pressable>

      <View className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-background border-t border-border shadow-2xl">
        {/* Drag handle */}
        <View className="items-center pt-3 pb-2">
          <View className="h-1 w-10 rounded-full bg-border" />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-xl font-bold text-foreground mb-5">
            Delivery address
          </Text>

          {/* Saved Addresses */}
          <View className="gap-4">
            {SAVED_ADDRESSES.map((addr) => {
              const isSelected = selectedId === addr.id;
              return (
                <Pressable
                  key={addr.id}
                  onPress={() => {
                    onSelect(addr.id, addr.label, addr.address);
                    toast.success(`Delivering to ${addr.label}`);
                    onClose();
                  }}
                  className="flex-row items-center py-1 active:opacity-80"
                >
                  {/* Radio circle */}
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-2 mr-4 ${
                      isSelected
                        ? "border-[#00B37A] bg-[#00B37A]"
                        : "border-border bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <View className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </View>

                  {/* Label + Address */}
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {addr.label}
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-0.5">
                      {addr.address}
                    </Text>
                  </View>

                  {/* Default badge */}
                  {addr.isDefault && (
                    <View className="rounded-md bg-secondary px-2.5 py-1">
                      <Text className="text-xs font-bold text-[#00B37A]">
                        Default
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Divider */}
          <View className="h-px bg-border my-5" />

          {/* Add new address */}
          <Pressable
            onPress={() => {
              onClose();
              router.push("/(auth)/add-address");
            }}
            className="flex-row items-center active:opacity-80"
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#00B37A] mr-3">
              <Feather name="plus" size={18} color="#ffffff" />
            </View>
            <Text className="text-base font-semibold text-[#00B37A]">
              Add new address
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
