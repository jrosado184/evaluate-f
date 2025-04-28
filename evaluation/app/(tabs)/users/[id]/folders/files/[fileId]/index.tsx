import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
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
          foundFile = file;
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

  const handleAddEvaluation = () => {
    router.push({
      pathname: `/users/${userId}/folders/files/${fileId}/edit-form`,
      params: { step: 2 },
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1a237e" />
      </SafeAreaView>
    );
  }

  if (!fileData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-neutral-600">No file data found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
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
            <View className="mb-10">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Evaluation Timeline
              </Text>
              {fileData.evaluations?.length > 0 ? (
                <EvaluationTimeline evaluations={fileData.evaluations} />
              ) : (
                <Text className="text-base text-gray-600">
                  No evaluations yet. Start by adding one!
                </Text>
              )}
            </View>

            {/* Add Evaluation Button */}
            <TouchableOpacity
              onPress={handleAddEvaluation}
              activeOpacity={0.85}
              className="bg-[#1a237e] py-4 rounded-lg items-center justify-center"
            >
              <Text className="text-white text-lg font-inter-semibold">
                Add New Evaluation
              </Text>
            </TouchableOpacity>
          </View>
        }
        data={[]} // no list items
        renderItem={null}
        keyExtractor={() => "dummy"} // dummy key
        contentContainerStyle={{
          paddingBottom: 140, // <<< ✨ ADDED to fix the button being covered
        }}
      />
    </SafeAreaView>
  );
};

export default FileDetailsScreen;
