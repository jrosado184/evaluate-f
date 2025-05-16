import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import EvaluationTimeline from "@/components/EvaluationTimeline";
import EvaluationButton from "@/components/buttons/EvaluationButton";

const FileDetailsScreen = () => {
  const { id: userId, fileId, ...params } = useLocalSearchParams();
  const [fileData, setFileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFileData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      const res = await axios.get(`${baseUrl}/employees/${userId}`, {
        headers: { Authorization: token },
      });

      let foundFile = null;
      for (const folder of res.data.folders) {
        const file = folder.files.find((f: any) => f._id === fileId);
        if (file) {
          foundFile = { ...file, folderId: folder._id };
          break;
        }
      }

      if (!foundFile) {
        Alert.alert("Error", "File not found");
        return;
      }

      // Merge updated fields from router params into personalInfo
      const updatedFields = [
        "trainingType",
        "phoneNumber",
        "jobStartDate",
        "projectedTrainingHours",
        "projectedQualifyingDate",
      ];

      const updatedPersonalInfo = { ...foundFile.personalInfo };
      updatedFields.forEach((key) => {
        if (params[key]) {
          updatedPersonalInfo[key] = params[key];
        }
      });

      setFileData({ ...foundFile, personalInfo: updatedPersonalInfo });
    } catch (err: any) {
      console.error("Failed to fetch file:", err.message);
      Alert.alert("Error", "Could not load file information.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFileData();
    }, [])
  );

  const pdfpreview = fileData?.fileUrl?.split("/")[2];
  const evaluationsCompletedCount = fileData?.evaluations?.length || 0;
  const canQualify = evaluationsCompletedCount >= 3;

  const handleContinue = async () => {
    if (isSubmitting || !fileData) return;

    const folderId = fileData.folderId;
    if (!folderId) {
      Alert.alert("Error", "Missing folderId for this file.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (fileData.status === "in_progress" && canQualify) {
        router.push(
          `/users/${userId}/folders/${folderId}/files/${fileId}/qualify`
        );
      } else if (fileData.status === "in_progress") {
        router.push(
          `/users/${userId}/folders/${folderId}/files/${fileId}/edit-form?step=2`
        );
      } else if (fileData.status === "incomplete") {
        router.push({
          pathname: `/users/${userId}/folders/${folderId}/files/${fileId}/edit-form`,
          params: {
            step: 1,
            status: fileData.status,
          },
        });
      }
    } catch (err) {
      Alert.alert("Error", "Navigation failed.");
    } finally {
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  };

  const handleExit = () => {
    if (fileData?.folderId) {
      router.replace(`/users/${userId}/folders/${fileData.folderId}`);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4">
        <TouchableOpacity
          onPress={handleExit}
          activeOpacity={0.85}
          className="flex-row items-center"
        >
          <Icon name="x" size={26} color="#1a237e" />
          <Text className="text-[#1a237e] text-base font-medium ml-2">
            Close
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1a237e" />
        </View>
      ) : !fileData ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-neutral-600">No file data found.</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <View style={{ padding: 20 }}>
              {/* Personal Info */}
              {fileData.personalInfo && (
                <View className="mb-8">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-gray-900">
                      Personal Information
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: `/users/${userId}/folders/${fileData.folderId}/files/${fileId}/edit-form`,
                          params: {
                            step: 1,
                            from: "details",
                            status: fileData.status,
                          },
                        })
                      }
                      className="px-3 py-1 border border-gray-300 rounded-md"
                    >
                      <Text className="text-sm text-[#1a237e] font-medium">
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {Object.entries(fileData.personalInfo).map(
                    ([key, value]: any) => (
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

              {/* Evaluation Timeline */}
              <View
                className={`mb-10 ${
                  fileData.evaluations.length === 0 &&
                  "h-[70vh] flex justify-center items-center"
                }`}
              >
                <Text
                  className={`${
                    fileData.evaluations.length !== 0
                      ? "text-xl font-bold text-gray-900 mb-4"
                      : "hidden"
                  } `}
                >
                  Evaluation Timeline
                </Text>
                {fileData.evaluations?.length > 0 ? (
                  <EvaluationTimeline fileData={fileData} />
                ) : (
                  <View className="items-center justify-center mt-4 mb-8 px-4">
                    <Icon
                      name="clipboard"
                      size={40}
                      color="#9ca3af"
                      style={{ marginBottom: 12 }}
                    />
                    <Text className="text-lg text-neutral-500 text-center font-medium mb-2">
                      No Evaluations Added Yet
                    </Text>
                    <Text className="text-base text-neutral-400 text-center mb-4">
                      When you're ready, start evaluating the team member’s
                      performance week by week.
                    </Text>
                    {fileData.status !== "complete" && (
                      <TouchableOpacity
                        onPress={handleContinue}
                        activeOpacity={0.85}
                        className="bg-[#1a237e] py-3 px-6 rounded-md"
                      >
                        <Text className="text-white font-semibold text-base">
                          Start Evaluation
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Start / Qualify Button */}
              {fileData.status !== "complete" ? (
                fileData.evaluations?.length > 0 && (
                  <EvaluationButton
                    status={fileData.status}
                    canQualify={canQualify}
                    onPress={handleContinue}
                    isLoading={isSubmitting}
                  />
                )
              ) : (
                <View className="w-full items-center bg-white">
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: `/users/${userId}/folders/${fileData.folderId}/files/${fileId}/${pdfpreview}`,
                        params: {
                          filename: pdfpreview,
                        },
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
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
          data={[]}
          renderItem={null}
          keyExtractor={() => "dummy"}
          contentContainerStyle={{ paddingBottom: 140 }}
        />
      )}
    </SafeAreaView>
  );
};

export default FileDetailsScreen;
