// components/evaluations/EvaluationSummary.tsx
// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import EvaluationTimeline from "@/components/evaluations/sheets/EvaluationTimeline";
import EvaluationButton from "@/components/buttons/EvaluationButton";
import Icon from "react-native-vector-icons/Feather";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { router } from "expo-router";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

type Props = {
  evaluationId: string;
  onClose: () => void;
  onEdit?: () => void; // should switch parent sheetView to step1
  onOpenStep2?: (args: { week: number }) => void; // should switch parent sheetView to step2 + set week
  inSheet?: boolean; //
};

const EvaluationSummary = ({
  evaluationId,
  onClose,
  onEdit,
  onOpenStep2,
  inSheet = false,
}: Props) => {
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchEvaluation = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

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

  const handleContinue = () => {
    if (!evaluation || submitting) return;

    const weeksDone = evaluation.evaluations?.length || 0;

    if (evaluation.status === "uploaded") {
      if (onEdit) onEdit();
      else navigateAfterClose(`/evaluations/${evaluationId}/edit/step1`);
      return;
    }

    if (evaluation.status === "in_progress") {
      // after 3 weeks -> qualify
      if (weeksDone >= 3) {
        setSubmitting(true);

        const nextRoute = {
          pathname: "/evaluations/[evaluationId]/qualify",
          params: {
            evaluationId,
            employee_name: evaluation?.personalInfo?.teamMemberName,
            department: evaluation?.personalInfo?.department,
            position: evaluation?.position,
          },
        };

        navigateAfterClose(nextRoute);
        setTimeout(() => setSubmitting(false), 300);
        return;
      }

      // open Step2 week N+1
      if (onOpenStep2) {
        onOpenStep2({ week: weeksDone + 1 });
        return;
      }

      setSubmitting(true);
      navigateAfterClose(
        `/evaluations/${evaluationId}/edit/step2?week=${weeksDone + 1}`,
      );
      setTimeout(() => setSubmitting(false), 300);
      return;
    }

    Alert.alert("Error", "Can't continue from here.");
  };

  // ---------- states ----------
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  if (!evaluation) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ color: "#6b7280" }}>No evaluation found.</Text>
      </View>
    );
  }

  // ---------- derived ----------
  const weeksDone = evaluation.evaluations?.length || 0;
  const canQualify = weeksDone >= 3;

  // safer pdf preview parsing
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
    { label: "Phone Number", value: info.phoneNumber || "-" },

    { label: "Training Position", value: evaluation?.position },
    { label: "Department", value: evaluation.department },
    {
      label: "Supervisor",
      value: evaluation?.supervisor?.name,
    },
    { label: "Job Start Date", value: info.jobStartDate },
    { label: "Projected Training Hours", value: info.projectedTrainingHours },
    { label: "Current Position", value: info.position },
    { label: "Current Supervisor", value: info?.supervisor?.name },
    {
      label: "Projected Qualifying Date",
      value: info.projectedQualifyingDate,
    },
  ];

  const Content = inSheet ? View : BottomSheetScrollView;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Content
        {...(!inSheet
          ? {
              keyboardShouldPersistTaps: "handled",
              showsVerticalScrollIndicator: false,
              contentContainerStyle: { paddingBottom: 140 },
            }
          : {})}
        style={{ flex: 1 }}
      >
        {/* Personal info block */}
        <View className="mb-6 pl-7 pt-6 pr-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Personal Information
            </Text>

            <SinglePressTouchable
              onPress={() => {
                if (onEdit) onEdit();
                else
                  navigateAfterClose(`/evaluations/${evaluationId}/edit/step1`);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md"
            >
              <Text className="text-sm text-[#1a237e] font-medium">Edit</Text>
            </SinglePressTouchable>
          </View>

          {rows.map((r) => (
            <View key={r.label} className="mb-3">
              <Text className="text-base text-gray-700">{r.label}:</Text>
              <Text className="text-lg text-gray-900 font-semibold">
                {String(r.value ?? "-")}
              </Text>
            </View>
          ))}
        </View>

        {/* Timeline or empty */}
        {weeksDone > 0 ? (
          <EvaluationTimeline
            fileData={evaluation}
            onOpenStep2={(weekNumber: number) =>
              onOpenStep2?.({ week: weekNumber })
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <Icon name="clipboard" size={40} color="#9ca3af" />
            <Text className="mt-3 text-center text-gray-600">
              No Evaluations Added Yet{"\n"}Tap below to start.
            </Text>
            <SinglePressTouchable
              onPress={handleContinue}
              disabled={submitting}
              className="mt-4 h-12 flex items-center justify-center bg-[#1a237e] px-6 rounded-md"
            >
              <Text className="text-white font-semibold">Start Evaluation</Text>
            </SinglePressTouchable>
          </View>
        )}

        {/* Continue / Qualify button */}
        {evaluation.status !== "complete" && weeksDone > 0 && (
          <View className="px-4 mt-8 mb-8">
            <EvaluationButton
              status={evaluation?.status}
              canQualify={canQualify}
              onPress={handleContinue}
              isLoading={submitting}
            />
          </View>
        )}

        {/* PDF link */}
        {weeksDone > 0 ? (
          <View className="w-full items-center bg-white">
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
              className="w-[90vw] border border-gray-300 rounded-lg bg-white px-4 py-3"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-inter-medium">
                    Evaluation Summary
                  </Text>
                  <Text className="text-sm text-neutral-500">
                    View as PDF document
                  </Text>
                </View>
                <View className="px-3 py-1 rounded-full bg-blue-100">
                  <Text className="text-xs font-inter-semibold text-blue-700">
                    View PDF
                  </Text>
                </View>
              </View>
            </SinglePressTouchable>
          </View>
        ) : null}
      </Content>
    </View>
  );
};

export default EvaluationSummary;
