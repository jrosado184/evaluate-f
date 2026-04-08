import React from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  rightText?: string;
  onRightPress?: () => void;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
};

export default function SectionCard({
  title,
  subtitle,
  rightText,
  onRightPress,
  children,
  containerStyle,
  contentStyle,
}: Props) {
  return (
    <View
      className="rounded-[24px] bg-white p-4"
      style={[
        {
          borderWidth: 1,
          borderColor: "#E3E8EF",
          shadowColor: "#0F172A",
          shadowOpacity: 0.035,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 1,
        },
        containerStyle,
      ]}
    >
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[15px] font-semibold text-[#111827]">
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-[12px] leading-5 text-neutral-500">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightText ? (
          <TouchableOpacity activeOpacity={0.85} onPress={onRightPress}>
            <Text className="text-[13px] font-medium text-blue-600">
              {rightText}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={contentStyle}>{children}</View>
    </View>
  );
}
