import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const kpiAccent = {
  neutral: "#D1D5DB",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  primary: "#2563EB",
} as const;

type Props = {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  accent?: keyof typeof kpiAccent;
  onPress?: () => void;
};

export default function KpiCard({
  label,
  value,
  sub,
  icon,
  accent = "neutral",
  onPress,
}: Props) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      className="rounded-[20px] bg-white"
      style={{
        paddingHorizontal: 14,
        paddingVertical: isTablet ? 14 : 12,
        minHeight: isTablet ? 112 : 100,
        borderWidth: 1,
        borderColor: "#E3E8EF",
        shadowColor: "#0F172A",
        shadowOpacity: 0.025,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
      }}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <View
          className="h-1.5 w-7 rounded-full"
          style={{ backgroundColor: kpiAccent[accent] }}
        />
        <View className="rounded-full bg-[#F6F8FB] p-2">
          <MaterialIcons name={icon as any} size={15} color="#6B7280" />
        </View>
      </View>

      <Text className="text-[11px] font-medium text-neutral-500">{label}</Text>

      <Text
        className="mt-1 font-semibold text-[#111827]"
        style={{
          fontSize: isTablet ? 27 : 24,
          letterSpacing: -0.6,
          lineHeight: isTablet ? 31 : 28,
        }}
      >
        {value}
      </Text>

      {sub ? (
        <Text className="mt-1 text-[11px] text-neutral-500">{sub}</Text>
      ) : null}
    </TouchableOpacity>
  );
}
