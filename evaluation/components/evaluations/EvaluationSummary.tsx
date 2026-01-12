import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import EvaluationTimeline from "@/app/(tabs)/evaluations/EvaluationTimeline";
import EvaluationButton from "@/components/buttons/EvaluationButton";
import Icon from "react-native-vector-icons/Feather";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { router } from "expo-router";

type Props = {
  evaluationId: string;
  onClose: () => void;
};

const EvaluationSummary = ({ evaluationId, onClose }: Props) => {
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
      onClose();
      // Small delay makes navigation reliable while the modal dismiss animation runs
      setTimeout(() => router.push(to), 50);
    },
    [onClose]
  );

  const handleContinue = () => {
    if (!evaluation || submitting) return;
    setSubmitting(true);

    const weeksDone = evaluation.evaluations?.length || 0;
    let nextRoute: any = "";

    if (evaluation.status === "uploaded") {
      nextRoute = `/evaluations/${evaluationId}/edit/step1`;
    } else if (evaluation.status === "in_progress") {
      nextRoute =
        weeksDone >= 3
          ? {
              pathname: "/evaluations/[evaluationId]/qualify",
              params: {
                evaluationId,
                employee_name: evaluation?.personalInfo.teamMemberName,
                department: evaluation?.personalInfo.department,
                position: evaluation?.position,
              },
            }
          : `/evaluations/${evaluationId}/edit/step2`;
    }

    if (nextRoute) {
      navigateAfterClose(nextRoute);
    } else {
      Alert.alert("Error", "Can't continue from here.");
    }

    setTimeout(() => setSubmitting(false), 300);
  };

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

  const weeksDone = evaluation.evaluations?.length || 0;
  const canQualify = weeksDone >= 3;
  const pdfpreview = evaluation?.fileUrl?.split("/")[2];

  const employeeId =
    evaluation?.employeeId ?? evaluation?.personalInfo?.employeeId ?? "";

  const info = evaluation.personalInfo || {};
  const rows = [
    { label: "Training Type", value: info.trainingType },
    { label: "Team Member Name", value: info.teamMemberName },
    { label: "Employee Id", value: info.employeeId },
    { label: "Hire Date", value: info.hireDate },
    { label: "Training Position", value: evaluation?.position },
    { label: "Department", value: evaluation.department },
    { label: "Supervisor", value: evaluation?.supervisor?.name },
    { label: "Locker Number", value: info.lockerNumber },
    { label: "Phone Number", value: info.phoneNumber || "-" },
    { label: "Job Start Date", value: info.jobStartDate },
    { label: "Projected Training Hours", value: info.projectedTrainingHours },
    { label: "Current Position", value: info.position },
    { label: "Current Supervisor", value: info?.supervisor?.name },
    { label: "Projected Qualifying Date", value: info.projectedQualifyingDate },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 pl-7 pt-6 pr-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Personal Information
            </Text>

            <SinglePressTouchable
              onPress={() =>
                navigateAfterClose({
                  pathname: `/evaluations/${evaluationId}/edit/step1`,
                  params: { id: String(employeeId) },
                })
              }
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

        {weeksDone > 0 ? (
          <EvaluationTimeline fileData={evaluation} />
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

        {weeksDone > 0 && (
          <View className="w-full items-center bg-white pt-8">
            <SinglePressTouchable
              onPress={() =>
                navigateAfterClose({
                  pathname: `/evaluations/${evaluationId}/${pdfpreview}`,
                  params: {
                    filename: String(pdfpreview),
                    employeeId: String(employeeId),
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
        )}
      </ScrollView>
    </View>
  );
};

export default EvaluationSummary;
