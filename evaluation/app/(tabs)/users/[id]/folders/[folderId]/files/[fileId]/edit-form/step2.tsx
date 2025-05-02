import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "@/app/requests/NetworkAddress";
import SignatureModal from "@/components/SignatureModal";
import useAuthContext from "@/app/context/AuthContext";

const Step2Form = () => {
  const router = useRouter();
  const { id, fileId, folderId, week } = useLocalSearchParams();
  const { currentUser } = useAuthContext();

  const currentWeek = parseInt((week as string) || "1", 10);
  const [formData, setFormData] = useState<any>({
    hoursMonday: "",
    hoursTuesday: "",
    hoursWednesday: "",
    hoursThursday: "",
    hoursFriday: "",
    hoursOffJob: "",
    percentQualified: "",
    expectedQualified: "",
    reTimeAchieved: "",
    yieldAuditDate: "",
    knifeSkillsAuditDate: "",
    knifeScore: "",
    handStretchCompleted: false,
    comments: "",
    trainerSignature: "",
    teamMemberSignature: "",
    supervisorSignature: "",
  });

  const [loading, setLoading] = useState(true);
  const [signatureType, setSignatureType] = useState<null | string>(null);
  const [traineeName, setTraineeName] = useState("Trainee");

  const projectedTrainingHours = 40;

  const totalHoursOnJob =
    (Number(formData.hoursMonday) || 0) +
    (Number(formData.hoursTuesday) || 0) +
    (Number(formData.hoursWednesday) || 0) +
    (Number(formData.hoursThursday) || 0) +
    (Number(formData.hoursFriday) || 0);

  const totalHours = totalHoursOnJob + (Number(formData.hoursOffJob) || 0);

  const expectedQualified = projectedTrainingHours
    ? ((totalHoursOnJob / projectedTrainingHours) * 100).toFixed(1)
    : "0";

  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      expectedQualified: expectedQualified.toString(),
    }));
  }, [
    formData.hoursMonday,
    formData.hoursTuesday,
    formData.hoursWednesday,
    formData.hoursThursday,
    formData.hoursFriday,
  ]);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        const res = await axios.get(`${baseUrl}/employees/${id}`, {
          headers: { Authorization: token },
        });

        const employee = res.data;
        const folder = employee.folders.find((f: any) => f._id === folderId);
        const file = folder.files.find((f: any) => f._id === fileId);
        const weekData = file.evaluations.find(
          (e: any) => e.weekNumber === currentWeek
        );

        if (employee?.employee_name) {
          setTraineeName(employee.employee_name);
        }

        if (weekData) {
          setFormData(weekData);
        }
      } catch (error: any) {
        console.error("Failed to fetch evaluation:", error.message);
        Alert.alert("Error", "Failed to load evaluation data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [currentWeek]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const toggleHandStretch = () => {
    setFormData((prev: any) => ({
      ...prev,
      handStretchCompleted: !prev.handStretchCompleted,
    }));
  };

  const handleBack = () => {
    router.replace(`/users/${id}/folders/${folderId}/files/${fileId}`);
  };

  const handleSignature = (base64: string) => {
    if (signatureType) {
      setFormData((prev: any) => ({
        ...prev,
        [signatureType]: base64,
      }));
    }
    setSignatureType(null);
  };

  const handleSubmit = async () => {
    try {
      const baseUrl = await getServerIP();
      await axios.patch(
        `${baseUrl}/employees/${id}/folders/${folderId}/files/${fileId}`,
        {
          action: "add_evaluation",
          data: {
            evaluation: {
              ...formData,
              totalHours,
              totalHoursOnJob,
              weekNumber: currentWeek,
            },
          },
        }
      );

      await axios.patch(
        `${baseUrl}/employees/${id}/folders/${folderId}/files/${fileId}`,
        {
          action: "update_status",
          data: { status: "in_progress" },
        }
      );

      router.replace(`/users/${id}/folders/${folderId}/files/${fileId}`);
    } catch (error: any) {
      console.error("Save failed:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to save evaluation.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
          className="px-5 pt-5"
        >
          {/* Back & Title */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={handleBack} className="mr-3">
              <Icon name="chevron-left" size={28} color="#1a237e" />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold text-gray-900">
              {`${currentWeek}${
                ["st", "nd", "rd"][
                  ((((currentWeek + 90) % 100) - 10) % 10) - 1
                ] || "th"
              } Week Information`}
            </Text>
          </View>

          {/* Input Fields */}
          {[
            { label: "Hours on Job - Monday", key: "hoursMonday" },
            { label: "Hours on Job - Tuesday", key: "hoursTuesday" },
            { label: "Hours on Job - Wednesday", key: "hoursWednesday" },
            { label: "Hours on Job - Thursday", key: "hoursThursday" },
            { label: "Hours on Job - Friday", key: "hoursFriday" },
            { label: "Hours Off Job", key: "hoursOffJob" },
            { label: "Percent Qualified (%)", key: "percentQualified" },
            { label: "RE Time Achieved", key: "reTimeAchieved" },
            { label: "Yield Audit Date", key: "yieldAuditDate" },
            { label: "Knife Audit Date", key: "knifeSkillsAuditDate" },
            { label: "Knife Score (%)", key: "knifeScore" },
            { label: "Comments", key: "comments", multiline: true },
          ].map((field) => (
            <View key={field.key} className="mb-5">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {field.label}
              </Text>
              <TextInput
                value={formData[field.key]}
                onChangeText={(text) => handleChange(field.key, text)}
                placeholder={field.label}
                multiline={!!field.multiline}
                numberOfLines={field.multiline ? 4 : 1}
                className={`border border-gray-300 rounded-md px-4 py-3 text-base text-gray-900 ${
                  field.multiline ? "text-start" : ""
                }`}
                style={{
                  textAlignVertical: field.multiline ? "top" : "center",
                }}
              />
            </View>
          ))}

          {/* Hand Stretch Toggle */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Hand Stretch Exercises Completed
            </Text>
            <TouchableOpacity
              onPress={toggleHandStretch}
              className={`py-3 rounded-md items-center ${
                formData.handStretchCompleted ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-lg font-semibold">
                {formData.handStretchCompleted ? "Yes" : "No"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Signatures */}
          {/* Signatures */}
          {[
            {
              key: "trainerSignature",
              signer: currentUser?.name || "Trainer",
            },
            {
              key: "teamMemberSignature",
              signer: traineeName,
            },
            {
              key: "supervisorSignature",
              signer: "Supervisor (TBD)",
            },
          ].map((field) => (
            <View key={field.key} className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {field.signer}
              </Text>
              <TouchableOpacity
                onPress={() => setSignatureType(field.key)}
                className="bg-gray-100 border border-gray-300 rounded-md px-4 py-3 justify-center items-center"
              >
                {formData[field.key] ? (
                  <Image
                    source={{ uri: formData[field.key] }}
                    className="w-full h-28"
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-gray-500">Tap to Sign</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
          {/* Totals */}
          <View className="mb-6">
            <Text className="text-lg font-medium text-gray-800">
              Total Hours on Job: {totalHoursOnJob}
            </Text>
            <Text className="text-lg font-medium text-gray-800">
              Total Hours: {totalHours}
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            className="bg-[#1a237e] py-4 rounded-md items-center"
          >
            <Text className="text-white text-lg font-semibold">
              Save and Continue
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <SignatureModal
        visible={!!signatureType}
        onOK={handleSignature}
        onCancel={() => setSignatureType(null)}
      />
    </View>
  );
};

export default Step2Form;
