import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import SectionCard from "./SectionCard";
import { DonutSegment } from "./dashboard.types";

type Props = {
  title: string;
  subtitle?: string;
  centerValue: string | number;
  centerLabel: string;
  segments: DonutSegment[];
  size: number;
  topStatLabel?: string;
  topStatValue?: string | number;
  matchHeight?: boolean;
};

export default function DonutChartCard({
  title,
  subtitle,
  centerValue,
  centerLabel,
  segments,
  size,
  topStatLabel,
  topStatValue,
  matchHeight = false,
}: Props) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(
    segments.reduce((sum, s) => sum + s.value, 0),
    1,
  );

  let cumulativePercent = 0;

  return (
    <SectionCard
      title={title}
      subtitle={subtitle}
      containerStyle={matchHeight ? { minHeight: 365 } : undefined}
      contentStyle={matchHeight ? { flex: 1 } : undefined}
    >
      {topStatLabel && topStatValue !== undefined ? (
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[12px] text-neutral-500">{topStatLabel}</Text>
          <Text className="text-[13px] font-semibold text-[#111827]">
            {topStatValue}
          </Text>
        </View>
      ) : null}

      <View
        className={
          isTablet ? "flex-row items-center justify-between" : "items-center"
        }
        style={matchHeight ? { flex: 1 } : undefined}
      >
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#ECEEF3"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {segments.map((segment, index) => {
                const percent = segment.value / total;
                const dashLength = circumference * percent;
                const dashGap = circumference - dashLength;
                const dashOffset = -circumference * cumulativePercent;

                cumulativePercent += percent;

                return (
                  <Circle
                    key={`${segment.label}-${index}`}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${dashLength} ${dashGap}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                  />
                );
              })}
            </G>
          </Svg>

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text className="text-[24px] font-semibold text-[#111827]">
              {centerValue}
            </Text>
            <Text className="mt-1 text-[12px] text-neutral-500">
              {centerLabel}
            </Text>
          </View>
        </View>

        <View className={isTablet ? "ml-6 flex-1" : "mt-4 w-full"}>
          {segments.map((segment) => {
            const percent = Math.round((segment.value / total) * 100);
            return (
              <View
                key={segment.label}
                className="mb-2 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View
                    className="mr-2 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <Text className="text-[13px] text-neutral-700">
                    {segment.label}
                  </Text>
                </View>
                <Text className="text-[13px] font-medium text-[#111827]">
                  {segment.value} · {percent}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </SectionCard>
  );
}
