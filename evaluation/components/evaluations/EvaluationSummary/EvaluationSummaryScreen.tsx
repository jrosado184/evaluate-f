// components/evaluations/EvaluationSummary/EvaluationSummaryScreen.tsx
// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import EvaluationButton from "@/components/buttons/EvaluationButton";
import Icon from "react-native-vector-icons/Feather";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { router } from "expo-router";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import PersonalInfoSection from "./PersonalInfoSection";
import WeekCard from "./WeekCard";
import EmptyEvaluationsState from "./EmptyEvaluationState";
import { EvaluationSummaryProps, InfoRowItem } from "./types";

const EvaluationSummary = ({
  evaluationId,
  onClose,
  onEdit,
  onOpenStep2,
  onOpenQualify,
  inSheet = false,
}: EvaluationSummaryProps) => {
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
      if (onOpenStep2) {
        onOpenStep2({ week });
        return;
      }

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

  const handleDeleteWeek = useCallback(
    async (weekNumber: number) => {
      try {
        setSubmitting(true);

        const token = await AsyncStorage.getItem("token");
        const baseUrl = apiBase || (await getServerIP());

        const updated = await axios.patch(
          `${baseUrl}/evaluations/${evaluationId}`,
          {
            action: "delete_week",
            data: { weekNumber },
          },
          {
            headers: { Authorization: token! },
          },
        );

        setEvaluation(updated.data);
      } catch (err: any) {
        console.error("Failed to delete week:", err);
        Alert.alert(
          "Error",
          err?.response?.data?.message || "Failed to delete week.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [apiBase, evaluationId],
  );

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

  const rows: InfoRowItem[] = [
    // Team Member
    { label: "Team Member Name", value: info.teamMemberName },
    { label: "Employee ID", value: info.employeeId },
    { label: "Phone Number", value: info.phoneNumber },
    { label: "Locker Number", value: info.lockerNumber },

    // Employment / baseline
    { label: "Hire Date", value: info.hireDate },
    { label: "Training Type", value: info.trainingType },

    // Training Assignment
    { label: "Training Position", value: evaluation?.position },
    { label: "Training Department", value: evaluation?.department },
    { label: "Training Supervisor", value: evaluation?.supervisor?.name },

    // Current Employee Info
    { label: "Current Position", value: info.position },
    { label: "Current Department", value: info.department },
    { label: "Current Supervisor", value: info?.supervisor?.name },

    // Timeline / projections
    { label: "Job Start Date", value: info.jobStartDate },
    { label: "Projected Training Hours", value: info.projectedTrainingHours },
    { label: "Projected Qualifying Date", value: info.projectedQualifyingDate },
  ];

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
          const canAddAnother = evaluation.status !== "complete";

          return (
            <View key={idx}>
              <WeekCard
                lastWeekAdded={isLatest}
                week={week}
                weekNumber={idx + 1}
                apiBase={apiBase}
                onEdit={
                  evaluation.status !== "complete"
                    ? () => openWeekEditor(idx + 1)
                    : undefined
                }
                onDelete={handleDeleteWeek}
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
      <EmptyEvaluationsState onStart={handleContinue} submitting={submitting} />
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
      {inSheet ? (
        <BottomSheetScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{
            paddingBottom: 32,
            flexGrow: 1,
          }}
        >
          <PersonalInfoSection
            rows={rows}
            evaluation={evaluation}
            evaluationId={evaluationId}
            onEdit={onEdit}
            onNavigateAfterClose={navigateAfterClose}
          />

          {weeksSection}
          {continueSection}
          {pdfSection}
        </BottomSheetScrollView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 32,
            flexGrow: 1,
          }}
        >
          <PersonalInfoSection
            rows={rows}
            evaluation={evaluation}
            evaluationId={evaluationId}
            onEdit={onEdit}
            onNavigateAfterClose={navigateAfterClose}
          />

          {weeksSection}
          {continueSection}
          {pdfSection}
        </ScrollView>
      )}
    </View>
  );
};

export default EvaluationSummary;
