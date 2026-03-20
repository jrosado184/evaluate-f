// @ts-nocheck
import React from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { StatCell } from "./SummaryPrimitives";
import {
  absFromRelative,
  getProgressColor,
  getProgressTextColor,
  isEmpty,
  normalizeBoolLike,
} from "./SummaryHelpers";
import { WeekCardProps } from "./types";

export default function WeekCard({
  week,
  weekNumber,
  onEdit,
  apiBase,
  lastWeekAdded,
  onDelete,
}: WeekCardProps) {
  const actual = parseFloat(week?.percentQualified ?? 0);
  const expected = parseFloat(week?.expectedQualified ?? 0);
  const progressColor = getProgressColor(actual, expected);
  const textColor = getProgressTextColor(actual, expected);
  const fillPercent =
    expected > 0 ? Math.min((actual / expected) * 100, 100) : 0;

  const stretchVal = normalizeBoolLike(
    week?.stretchCompleted ?? week?.handStretchCompleted ?? week?.stretch,
  );
  const painVal = normalizeBoolLike(week?.experiencingPain ?? week?.hasPain);

  const stretchColor = !isEmpty(stretchVal)
    ? stretchVal === "Yes"
      ? "#16A34A"
      : "#DC2626"
    : undefined;

  const painColor = !isEmpty(painVal)
    ? painVal === "No"
      ? "#16A34A"
      : "#DC2626"
    : undefined;

  const stats: Array<{ label: string; value: any; color?: string }> = [
    { label: "Hours on Job", value: week?.totalHoursOnJob },
    { label: "Hours off Job", value: week?.totalHoursOffJob },
    { label: "With Trainee", value: week?.totalHoursWithTrainee },
    {
      label: "Pct Qualified",
      value: !isEmpty(week?.percentQualified) ? `${actual}%` : null,
      color: textColor,
    },
    {
      label: "Expected Qual.",
      value: !isEmpty(week?.expectedQualified) ? `${expected}%` : null,
    },
    { label: "RE Time", value: week?.reTimeAchieved },
    {
      label: "Knife Audit",
      value: week?.knifeSkillsAuditDate ?? week?.knifeAuditDate,
    },
    { label: "Yield Audit", value: week?.yieldAuditDate },
    { label: "Knife Score", value: week?.knifeScore },
    { label: "Stretch", value: stretchVal, color: stretchColor },
    { label: "Pain", value: painVal, color: painColor },
  ];

  const gridStats =
    stats.length % 2 !== 0
      ? [...stats, { label: "", value: "__empty__" }]
      : stats;

  const lastRowStart = gridStats.length - 2;

  const signatures = [
    {
      key: "trainerSignature",
      label: "Trainer",
      raw: week?.trainerSignature,
    },
    {
      key: "teamMemberSignature",
      label: "Team Member",
      raw: week?.teamMemberSignature,
    },
    {
      key: "supervisorSignature",
      label: "Supervisor",
      raw: week?.supervisorSignature,
    },
  ] as const;

  return (
    <View className="mb-3.5 overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white">
      <View className="flex-row items-center justify-between px-4 pt-3.5 pb-2">
        <Text className="text-base font-bold text-gray-900">
          Week {weekNumber}
        </Text>

        <View className="flex-row items-center">
          <Text className="text-sm font-bold" style={{ color: textColor }}>
            {actual}%
          </Text>
          <Text className="text-xs font-normal text-gray-300">
            {" "}
            / {expected}% expected
          </Text>

          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              className="ml-2.5 rounded-md bg-blue-50 p-1.5"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="edit-2" size={13} color="#2563EB" />
            </TouchableOpacity>
          )}
          {lastWeekAdded && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Delete week?",
                  "Are you sure you want to delete this week?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => onDelete(weekNumber), // or your delete handler
                    },
                  ],
                )
              }
              className="ml-2.5 rounded-md bg-blue-50 p-1.5"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="trash" size={13} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="gap-1 px-4 pb-2.5">
        <View className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <View
            className="h-1.5 rounded-full"
            style={{
              width: `${fillPercent}%`,
              backgroundColor: progressColor,
            }}
          />
        </View>
        <Text className="text-[11px] font-medium" style={{ color: textColor }}>
          {fillPercent.toFixed(0)}% toward goal
        </Text>
      </View>

      <View className="mx-4 h-px bg-gray-200" />

      <View className="flex-row flex-wrap px-4 pt-1">
        {gridStats.map((s, i) => {
          if (s.label === "" && s.value === "__empty__") {
            return (
              <View key={`__spacer__${i}`} className="w-1/2 py-2.5 pr-3.5" />
            );
          }

          return (
            <StatCell
              key={`${s.label}-${i}`}
              label={s.label}
              value={s.value}
              color={s.color}
              isLastRow={i >= lastRowStart}
            />
          );
        })}
      </View>

      <View className="mx-4 mt-2 rounded-xl border border-[#EBEBEB] bg-[#FAFAFA] p-3">
        <View className="mb-1.5 flex-row items-center">
          <Icon name="message-square" size={12} color="#9CA3AF" />
          <Text className="ml-1 text-[10px] font-bold uppercase tracking-[0.5px] text-gray-400">
            Comments
          </Text>
        </View>

        {isEmpty(week?.comments) ? (
          <Text className="text-[13px] italic text-gray-300">
            No comments added yet
          </Text>
        ) : (
          <Text className="text-[13px] leading-[21px] text-gray-700">
            {week.comments}
          </Text>
        )}
      </View>

      <View className="px-4 pt-3 pb-3.5">
        <View className="mb-2 flex-row items-center">
          <Icon name="pen-tool" size={12} color="#9CA3AF" />
          <Text className="ml-1 text-[10px] font-bold uppercase tracking-[0.5px] text-gray-400">
            Signatures
          </Text>
        </View>

        <View className="flex-row gap-2.5">
          {signatures.map((sig) => {
            const rawValue = sig.raw;
            const uri =
              rawValue && typeof rawValue === "string"
                ? rawValue.startsWith("/api/")
                  ? absFromRelative(rawValue, apiBase)
                  : rawValue
                : "";

            return (
              <View
                key={sig.key}
                className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-[#FAFAFA]"
              >
                <View className="h-[58px] items-center justify-center border-b-2 border-dashed border-gray-200 bg-white">
                  {uri ? (
                    <Image
                      source={{ uri }}
                      className="h-full w-full"
                      resizeMode="contain"
                    />
                  ) : (
                    <Icon name="edit-3" size={16} color="#D1D5DB" />
                  )}
                </View>

                <View className="items-center bg-gray-50 py-1.5">
                  <Text className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400">
                    {sig.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
