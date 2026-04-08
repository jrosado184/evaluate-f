import React from "react";
import { Text, View } from "react-native";

type Props = {
  label: string;
  value: number;
  tone: "danger" | "warning" | "success" | "primary";
};

export default function RiskPill({ label, value, tone }: Props) {
  const map = {
    danger: {
      bg: "#FEF2F2",
      border: "#FECACA",
      text: "#B91C1C",
    },
    warning: {
      bg: "#FFFBEB",
      border: "#FDE68A",
      text: "#B45309",
    },
    success: {
      bg: "#ECFDF5",
      border: "#A7F3D0",
      text: "#047857",
    },
    primary: {
      bg: "#EFF6FF",
      border: "#BFDBFE",
      text: "#1D4ED8",
    },
  };

  const s = map[tone];

  return (
    <View
      className="flex-1 rounded-[18px] px-3 py-3"
      style={{ backgroundColor: s.bg, borderWidth: 1, borderColor: s.border }}
    >
      <Text className="text-[12px] font-medium" style={{ color: s.text }}>
        {label}
      </Text>
      <Text
        className="mt-1 text-[22px] font-semibold"
        style={{ color: s.text }}
      >
        {value}
      </Text>
    </View>
  );
}
