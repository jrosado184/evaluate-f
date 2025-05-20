import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalSearchParams, router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Icon from "react-native-vector-icons/Feather";

const EvaluationsIndex = () => {
  const { id } = useGlobalSearchParams();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setAddEmployeeInfo } = useEmployeeContext();

  const fetchEvaluations = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      const res = await axios.get(`${baseUrl}/employees/${id}`, {
        headers: { Authorization: token },
      });

      const allEvaluations =
        res.data?.folders?.flatMap(
          (folder: any) =>
            folder.files
              ?.filter((file: any) => file.evaluations?.length > 0)
              .map((file: any) => ({
                ...file,
                folderName: folder.name,
                folderId: folder._id,
              })) || []
        ) || [];

      setEvaluations(allEvaluations);
      setAddEmployeeInfo(res.data);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      Alert.alert("Error", "Could not load evaluation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleOpen = (file: any) => {
    router.push(`/users/${id}/evaluations/${file._id}`);
  };

  const renderEvaluation = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleOpen(item)}
      className="bg-white shadow-sm border border-neutral-200 rounded-xl px-4 py-3 mx-4 mb-3"
    >
      <View className="mb-1">
        <Text className="text-base font-semibold">
          {item.jobTitle || "Job Title Unknown"}
        </Text>
        <Text className="text-sm text-gray-600">
          Task: {item.name || "Unknown Task"}
        </Text>
      </View>
      <View className="flex-row justify-between mt-1">
        <View>
          <Text className="text-xs text-gray-400">
            Created: {formatISODate(item.uploadedAt)}
          </Text>
          <Text className="text-xs text-gray-400">
            By: {item.createdBy || "Unknown"}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              item.status === "complete"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {item.status === "complete" ? "Completed" : "In Progress"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="bg-neutral-50 h-full">
      <View className="px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Icon name="chevron-left" size={28} />
          <Text className="text-xl font-semibold ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold mb-4">Evaluations</Text>

        {loading ? (
          <ActivityIndicator size="large" color="gray" className="mt-12" />
        ) : evaluations.length === 0 ? (
          <Text className="text-center text-sm text-gray-500 mt-12">
            No evaluations found.
          </Text>
        ) : (
          <FlatList
            data={evaluations}
            renderItem={renderEvaluation}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default EvaluationsIndex;
