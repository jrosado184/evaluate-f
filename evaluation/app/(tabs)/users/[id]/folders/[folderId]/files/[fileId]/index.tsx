import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import EvaluationTimeline from "@/components/EvaluationTimeline";

const FileDetailsScreen = () => {
  const { id: userId, fileId } = useLocalSearchParams();
  const [fileData, setFileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      setFileData(foundFile);
    } catch (err: any) {
      console.error("Failed to fetch file:", err.message);
      Alert.alert("Error", "Could not load file information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileData();
  }, []);

  const handleContinue = () => {
    if (!fileData) return;

    const folderId = fileData.folderId;
    if (!folderId) {
      Alert.alert("Error", "Missing folderId for this file.");
      return;
    }

    if (fileData.status === "in progress") {
      router.push(
        `/users/${userId}/folders/${folderId}/files/${fileId}/edit-form?step=2`
      );
    }
    if (fileData.status === "incomplete") {
      router.push(
        `/users/${userId}/folders/${folderId}/files/${fileId}/edit-form?step=1`
      );
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
      {/* Exit Button */}
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
                  <Text className="text-xl font-bold text-gray-900 mb-4">
                    Personal Information
                  </Text>
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
                  <EvaluationTimeline evaluations={fileData.evaluations} />
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

              {/* Start / Continue Button if evaluations exist */}
              {fileData.status !== "complete" &&
                fileData.evaluations?.length > 0 && (
                  <TouchableOpacity
                    onPress={handleContinue}
                    activeOpacity={0.85}
                    className={`py-4 rounded-lg items-center justify-center ${
                      fileData.status === "incomplete"
                        ? "bg-[#1a237e]"
                        : "bg-[#059669]"
                    }`}
                  >
                    <Text className="text-white text-lg font-inter-semibold">
                      {fileData.status === "incomplete"
                        ? "Start Evaluation"
                        : "Qualify"}
                    </Text>
                  </TouchableOpacity>
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
