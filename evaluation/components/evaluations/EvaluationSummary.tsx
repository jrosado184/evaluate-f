// components/evaluations/EvaluationSummary.tsx
// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import EvaluationButton from "@/components/buttons/EvaluationButton";
import Icon from "react-native-vector-icons/Feather";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { router } from "expo-router";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

type Props = {
  evaluationId: string;
  onClose: () => void;
  onEdit?: () => void;
  onOpenStep2?: (args: { week: number }) => void;
  onOpenQualify?: (args: {
    evaluationId: string;
    employee_name?: string;
    department?: string;
    position?: string;
  }) => void;
  inSheet?: boolean;
};

/* ───────────────── helpers ───────────────── */

function getProgressColor(actual: number, expected: number): string {
  if (!expected || expected === 0) return "#9CA3AF";
  const ratio = actual / expected;
  if (ratio >= 1) return "#16A34A";
  if (ratio >= 0.1) return "#F59E0B";
  return "#DC2626";
}

function getProgressTextColor(actual: number, expected: number): string {
  if (!expected || expected === 0) return "#9CA3AF";
  const ratio = actual / expected;
  if (ratio >= 1) return "#16A34A";
  if (ratio >= 0.1) return "#D97706";
  return "#DC2626";
}

function isEmpty(val: any): boolean {
  return (
    val === null ||
    val === undefined ||
    String(val).trim() === "" ||
    String(val).trim() === "-"
  );
}

function absFromRelative(rel: string, baseUrl: string) {
  if (!rel) return "";
  if (!rel.startsWith("/")) return rel;

  try {
    const u = new URL(baseUrl);
    return `${u.origin}${rel}`;
  } catch {
    const origin = baseUrl.replace(/\/api\/?$/, "");
    return `${origin}${rel}`;
  }
}

function normalizeBoolLike(val: any) {
  if (val === true) return "Yes";
  if (val === false) return "No";
  return val;
}

/* ───────────────── pills ───────────────── */

const EmptyPill = ({ small = false }: { small?: boolean }) => (
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

const PendingPill = () => (
  <View className="mt-0.5 self-start flex-row items-center rounded-full bg-gray-100 px-2 py-0.5">
    <View className="mr-1 h-[5px] w-[5px] rounded-full bg-gray-300" />
    <Text className="text-[11px] font-medium text-gray-300">Pending</Text>
  </View>
);

/* ───────────────── shared rows ───────────────── */

const InfoRow = ({
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

const StatCell = ({
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

/* ───────────────── week card ───────────────── */

const WeekCard = ({
  week,
  weekNumber,
  onEdit,
  apiBase,
}: {
  week: any;
  weekNumber: number;
  onEdit?: () => void;
  apiBase: string;
}) => {
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
};

/* ───────────────── main ───────────────── */

const EvaluationSummary = ({
  evaluationId,
  onClose,
  onEdit,
  onOpenStep2,
  onOpenQualify,
  inSheet = false,
}: Props) => {
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiBase, setApiBase] = useState("");

  const fetchEvaluation = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      setApiBase(baseUrl);

      const res = await axios.get(`${baseUrl}/evaluations/${evaluationId}`, {
        headers: { Authorization: token! },
      });

      setEvaluation(res?.data);
    } catch (err: any) {
      console.error("Failed to fetch evaluation:", err);
      Alert.alert("Error", "Could not load evaluation information.");
    } finally {
      setLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    if (evaluationId) fetchEvaluation();
  }, [evaluationId, fetchEvaluation]);

  const navigateAfterClose = useCallback(
    (to: any) => {
      onClose?.();
      setTimeout(() => router.push(to), 50);
    },
    [onClose],
  );

  const openWeekEditor = useCallback(
    (week: number) => {
      // IMPORTANT:
      // Inside the sheet flow, do NOT close the sheet.
      // Just tell the parent to switch to step2 like the original behavior.
      if (onOpenStep2) {
        onOpenStep2({ week });
        return;
      }

      // Standalone fallback
      navigateAfterClose(
        `/evaluations/${evaluationId}/edit/step2?week=${week}`,
      );
    },
    [onOpenStep2, navigateAfterClose, evaluationId],
  );

  const handleAddWeek = useCallback(() => {
    if (!evaluation || submitting) return;

    const weeksDone = evaluation.evaluations?.length || 0;

    if (evaluation.status === "complete") {
      Alert.alert("Completed", "This evaluation is already complete.");
      return;
    }

    if (weeksDone >= 3) {
      Alert.alert(
        "Limit reached",
        "This evaluation already has the maximum number of weeks.",
      );
      return;
    }

    openWeekEditor(weeksDone + 1);
  }, [evaluation, submitting, openWeekEditor]);

  const handleContinue = () => {
    if (!evaluation || submitting) return;

    const weeksDone = evaluation.evaluations?.length || 0;

    if (evaluation.status === "uploaded") {
      if (onEdit) onEdit();
      else navigateAfterClose(`/evaluations/${evaluationId}/edit/step1`);
      return;
    }

    if (evaluation.status === "in_progress") {
      if (weeksDone >= 3) {
        const payload = {
          evaluationId,
          employee_name: evaluation?.personalInfo?.teamMemberName,
          department: evaluation?.personalInfo?.department,
          position: evaluation?.position,
        };

        if (onOpenQualify) {
          onOpenQualify(payload);
          return;
        }

        Alert.alert("Error", "Qualify view not available in this screen.");
        return;
      }

      openWeekEditor(weeksDone + 1);
      return;
    }

    Alert.alert("Error", "Can't continue from here.");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  if (!evaluation) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-[15px] text-gray-500">No evaluation found.</Text>
      </View>
    );
  }

  const weeksDone = evaluation.evaluations?.length || 0;
  const canQualify = weeksDone >= 3;

  const pdfpreview =
    typeof evaluation?.fileUrl === "string"
      ? evaluation.fileUrl.split("/").filter(Boolean).pop()
      : "";

  const info = evaluation.personalInfo || {};

  const rows: Array<{ label: string; value: any }> = [
    { label: "Training Type", value: info.trainingType },
    { label: "Team Member Name", value: info.teamMemberName },
    { label: "Employee Id", value: info.employeeId },
    { label: "Hire Date", value: info.hireDate },
    { label: "Locker Number", value: info.lockerNumber },
    { label: "Phone Number", value: info.phoneNumber },
    { label: "Training Position", value: evaluation?.position },
    { label: "Department", value: evaluation?.department },
    { label: "Supervisor", value: evaluation?.supervisor?.name },
    { label: "Job Start Date", value: info.jobStartDate },
    { label: "Projected Training Hours", value: info.projectedTrainingHours },
    { label: "Current Position", value: info.position },
    { label: "Current Supervisor", value: info?.supervisor?.name },
    { label: "Projected Qualifying Date", value: info.projectedQualifyingDate },
  ];

  const personalInfoSection = (
    <View className="px-4 pt-6 pb-1">
      <View className="mb-3 flex-row items-center justify-between px-0.5">
        <Text className="text-[17px] font-bold tracking-[-0.3px] text-gray-900">
          Personal Information
        </Text>

        <SinglePressTouchable
          onPress={() => {
            if (onEdit) onEdit();
            else navigateAfterClose(`/evaluations/${evaluationId}/edit/step1`);
          }}
          className="flex-row items-center rounded-lg bg-blue-50 px-3 py-1.5"
        >
          <Icon
            name="edit-2"
            size={12}
            color="#2563EB"
            style={{ marginRight: 4 }}
          />
          <Text className="text-[13px] font-semibold text-blue-600">Edit</Text>
        </SinglePressTouchable>
      </View>

      <View className="overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white px-4">
        {rows.map((r, i) => (
          <InfoRow
            key={r.label}
            label={r.label}
            value={r.value}
            isLast={i === rows.length - 1}
          />
        ))}
      </View>
    </View>
  );

  const weeksSection =
    weeksDone > 0 ? (
      <View className="px-4 pt-5">
        <View className="mb-3 px-0.5">
          <Text className="text-[17px] font-bold tracking-[-0.3px] text-gray-900">
            Weekly Evaluations
          </Text>
        </View>

        {(evaluation.evaluations as any[]).map((week, idx) => {
          const isLatest = idx === weeksDone - 1;
          const canAddAnother =
            evaluation.status !== "complete" && weeksDone < 3 && isLatest;

          return (
            <View key={idx}>
              <WeekCard
                week={week}
                weekNumber={idx + 1}
                apiBase={apiBase}
                onEdit={
                  evaluation.status !== "complete"
                    ? () => openWeekEditor(idx + 1)
                    : undefined
                }
              />

              {canAddAnother && (
                <SinglePressTouchable
                  onPress={handleAddWeek}
                  className="mb-4 mt-0.5 flex-row items-center justify-center rounded-xl border border-blue-200 bg-blue-50 py-3"
                >
                  <Icon name="plus" size={14} color="#2563EB" />
                  <Text className="ml-1.5 text-sm font-semibold text-blue-600">
                    Add Week {weeksDone + 1}
                  </Text>
                </SinglePressTouchable>
              )}
            </View>
          );
        })}
      </View>
    ) : (
      <View className="items-center justify-center px-8 py-14">
        <View className="mb-4 h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-gray-100">
          <Icon name="clipboard" size={50} color="#9CA3AF" />
        </View>

        <Text className="mb-1.5 text-base font-bold text-gray-700">
          No evaluations yet
        </Text>
        <Text className="mb-5 text-center text-sm leading-5 text-gray-400">
          Tap below to start the first week.
        </Text>

        <SinglePressTouchable
          onPress={handleContinue}
          disabled={submitting}
          className="h-12 items-center justify-center rounded-xl bg-[#1a237e] px-7"
        >
          <Text className="text-[15px] font-semibold text-white">
            Start Evaluation
          </Text>
        </SinglePressTouchable>
      </View>
    );

  const continueSection =
    evaluation.status !== "complete" && weeksDone > 0 ? (
      <View className="mt-4 mb-2 px-4">
        <EvaluationButton
          status={evaluation?.status}
          canQualify={canQualify}
          onPress={handleContinue}
          isLoading={submitting}
        />
      </View>
    ) : (
      <View className="h-2" />
    );

  const pdfSection =
    weeksDone > 0 ? (
      <View className="px-4 pt-2 pb-6">
        <SinglePressTouchable
          onPress={() =>
            navigateAfterClose({
              pathname: `/evaluations/${evaluationId}/[pdfpreview]`,
              params: {
                filename: String(pdfpreview),
                employeeId: evaluation?.employeeId,
              },
            })
          }
          className="flex-row items-center rounded-[14px] border border-[#EBEBEB] bg-white px-4 py-3.5"
        >
          <View className="mr-3 h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-blue-50">
            <Icon name="file-text" size={18} color="#2563EB" />
          </View>

          <View className="flex-1">
            <Text className="mb-0.5 text-sm font-semibold text-gray-900">
              Evaluation Summary
            </Text>
            <Text className="text-xs text-gray-400">View as PDF document</Text>
          </View>

          <View className="rounded-full bg-blue-100 px-3 py-1">
            <Text className="text-xs font-semibold text-blue-700">
              View PDF
            </Text>
          </View>
        </SinglePressTouchable>
      </View>
    ) : null;

  const ScrollComponent = inSheet ? BottomSheetScrollView : ScrollView;

  return (
    <View className="flex-1 bg-[#F7F7F5]">
      <ScrollComponent
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {personalInfoSection}
        {weeksSection}
        {continueSection}
        {pdfSection}
      </ScrollComponent>
    </View>
  );
};

export default EvaluationSummary;
