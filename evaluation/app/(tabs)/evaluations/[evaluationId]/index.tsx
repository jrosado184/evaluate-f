import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useLocalSearchParams,
  useFocusEffect,
  router,
  useGlobalSearchParams,
  useSegments,
} from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import EvaluationTimeline from "@/app/(tabs)/evaluations/EvaluationTimeline";
import EvaluationButton from "@/components/buttons/EvaluationButton";
import Icon from "react-native-vector-icons/Feather";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchable from "@/app/utils/SinglePress";

const EvaluationSummary = () => {
  const { evaluationId }: { id: any; evaluationId: any } =
    useLocalSearchParams();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { from } = useGlobalSearchParams();

  const fetchEvaluation = async () => {
    try {
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
  };

  const segments: any = useSegments();
  const path = segments.join("/");

  const employeeId = evaluation?.employeeId;

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      if (path !== "(tabs)/users/[id]") {
        fetchEvaluation();
      } else {
        return;
      }
    }, [path])
  );

  const handleContinue = () => {
    if (!evaluation || submitting) return;
    setSubmitting(true);

    const weeksDone = evaluation.evaluations?.length || 0;
    let nextRoute: any = "";

    if (evaluation.status === "uploaded") {
      nextRoute = `/evaluations/${evaluationId}/step1`;
    } else if (evaluation.status === "in_progress") {
      nextRoute =
        weeksDone >= 3
          ? `/evaluations/${evaluationId}/qualify`
          : `/evaluations/${evaluationId}/step2`;
    }

    if (nextRoute) {
      router.push(nextRoute);
    } else {
      Alert.alert("Error", "Can't continue from here.");
    }

    setTimeout(() => setSubmitting(false), 300);
  };
  const handleClose = () => {
    if (from && typeof from === "string") {
      setTimeout(() => {
        router.replace(`/(tabs)/users/${from}`);
      }, 5);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1a237e" />
      </SafeAreaView>
    );
  }

  if (!evaluation) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">No evaluation found.</Text>
      </SafeAreaView>
    );
  }

  const weeksDone = evaluation.evaluations?.length || 0;
  const canQualify = weeksDone >= 3;
  const pdfpreview = evaluation?.fileUrl?.split("/")[2];

  return (
    <SafeAreaView className="flex-1 bg-white mb-14">
      {/* Header */}
      <View className="flex-row items-center p-4">
        <SinglePressTouchable onPress={handleClose} className="mr-4">
          <Icon name="x" size={26} color="#1a237e" />
        </SinglePressTouchable>
        <Text className="text-xl font-semibold">Evaluation Summary</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Personal Information */}
        {evaluation.personalInfo && (
          <View className="px-4 mb-6 pl-7 pt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">
                Personal Information
              </Text>
              <SinglePressTouchable
                onPress={() =>
                  router.replace({
                    pathname: `/evaluations/${evaluationId}/step1`,
                    params: {
                      from: "details",
                      id: employeeId,
                    },
                  })
                }
                className="px-3 py-1 border border-gray-300 rounded-md"
              >
                <Text className="text-sm text-[#1a237e] font-medium">Edit</Text>
              </SinglePressTouchable>
            </View>
            {Object.entries(evaluation.personalInfo).map(
              ([key, value]: [string, any]) => (
                <View key={key} className="mb-3">
                  <Text className="text-base text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}:
                  </Text>
                  <Text className="text-lg text-gray-900 font-semibold">
                    {value || "-"}
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        {/* Timeline or Placeholder */}
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
              className="mt-4 w-42 h-12 flex items-center justify-center bg-[#1a237e] px-6 py-2 rounded-md"
            >
              <Text className="text-white font-semibold">Start Evaluation</Text>
            </SinglePressTouchable>
          </View>
        )}

        {/* Continue / Qualify Button */}
        {evaluation.status !== "complete" && weeksDone > 0 && (
          <View className="px-4 mt-4 mb-8">
            <EvaluationButton
              status={evaluation.status}
              canQualify={canQualify}
              onPress={handleContinue}
              isLoading={submitting}
            />
          </View>
        )}

        {/* View PDF */}
        {weeksDone > 0 && (
          <View className="w-full items-center bg-white mt-4">
            <SinglePressTouchable
              onPress={() =>
                router.push({
                  pathname: `/evaluations/${evaluationId}/${pdfpreview}`,
                  params: { filename: pdfpreview, employeeId },
                })
              }
              activeOpacity={0.85}
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
    </SafeAreaView>
  );
};

export default EvaluationSummary;
