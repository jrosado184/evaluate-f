import React from "react";
import { Text, View } from "react-native";

type Props = {
  data: { label: string; value: number; target?: number }[];
  maxValue: number;
  chartHeight: number;
  barWidth: number;
};

export default function MiniBarChart({
  data,
  maxValue,
  chartHeight,
  barWidth,
}: Props) {
  return (
    <View className="mt-2 ">
      <View
        className="flex-row items-end justify-between"
        style={{ height: chartHeight }}
      >
        {data.map((item, index) => {
          const valueHeight =
            maxValue > 0
              ? Math.max(8, (item.value / maxValue) * chartHeight)
              : 8;

          const targetHeight =
            item.target && maxValue > 0
              ? Math.max(8, (item.target / maxValue) * chartHeight)
              : 0;

          return (
            <View key={`${item.label}-${index}`} className="items-center">
              <View
                style={{
                  height: chartHeight,
                  width: barWidth + 10,
                  justifyContent: "flex-end",
                }}
              >
                {item.target ? (
                  <View
                    style={{
                      position: "absolute",
                      bottom: targetHeight,
                      left: 5,
                      right: 5,
                      height: 2,
                      backgroundColor: "#94A3B8",
                      borderRadius: 999,
                    }}
                  />
                ) : null}

                <View
                  style={{
                    height: valueHeight,
                    width: barWidth,
                    alignSelf: "center",
                    backgroundColor: "#2563EB",
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                />
              </View>

              <Text className="mt-2 text-[11px] text-neutral-500">
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
