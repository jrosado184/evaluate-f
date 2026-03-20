// @ts-nocheck
import React from "react";
import { View, Text } from "react-native";
import { isEmpty } from "./SummaryHelpers";

export const EmptyPill = ({ small = false }: { small?: boolean }) => (
  <View
    className={`flex-row items-center rounded-full bg-gray-100 ${
      small ? "px-2 py-0.5" : "px-2.5 py-1"
    }`}
  >
    <View
      className={`mr-1 rounded-full bg-gray-300 ${
        small ? "h-1 w-1" : "h-[5px] w-[5px]"
      }`}
    />
    <Text
      className={`${small ? "text-[11px]" : "text-xs"} font-medium text-gray-300`}
    >
      Not set
    </Text>
  </View>
);

export const PendingPill = () => (
  <View className="mt-0.5 self-start flex-row items-center rounded-full bg-gray-100 px-2 py-0.5">
    <View className="mr-1 h-[5px] w-[5px] rounded-full bg-gray-300" />
    <Text className="text-[11px] font-medium text-gray-300">Pending</Text>
  </View>
);

export const InfoRow = ({
  label,
  value,
  isLast,
}: {
  label: string;
  value: any;
  isLast?: boolean;
}) => (
  <View
    className={`flex-row items-center justify-between gap-4 py-3 ${
      isLast ? "" : "border-b border-gray-200"
    }`}
  >
    <Text className="flex-1 text-[13px] font-medium text-gray-400">
      {label}
    </Text>
    {isEmpty(value) ? (
      <EmptyPill />
    ) : (
      <Text
        className="flex-1 text-right text-sm font-semibold text-gray-900"
        numberOfLines={2}
      >
        {String(value)}
      </Text>
    )}
  </View>
);

export const StatCell = ({
  label,
  value,
  color,
  isLastRow,
}: {
  label: string;
  value: any;
  color?: string;
  isLastRow?: boolean;
}) => (
  <View
    className={`w-1/2 py-2.5 pr-3.5 ${
      isLastRow ? "" : "border-b border-gray-200"
    }`}
  >
    <Text className="mb-1 text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400">
      {label}
    </Text>
    {isEmpty(value) ? (
      <PendingPill />
    ) : (
      <Text
        className="text-[15px] font-bold text-gray-900"
        style={color ? { color } : undefined}
      >
        {String(value)}
      </Text>
    )}
  </View>
);
