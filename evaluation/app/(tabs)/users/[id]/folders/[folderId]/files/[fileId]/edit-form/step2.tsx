// Step2Form.tsx
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
import useEvaluationsValidation from "@/app/validation/useEvaluationsValidation";

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
    hoursOffJobMonday: "",
    hoursOffJobTuesday: "",
    hoursOffJobWednesday: "",
    hoursOffJobThursday: "",
    hoursOffJobFriday: "",
    hoursWithTraineeMonday: "",
    hoursWithTraineeTuesday: "",
    hoursWithTraineeWednesday: "",
    hoursWithTraineeThursday: "",
    hoursWithTraineeFriday: "",
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [signatureType, setSignatureType] = useState<null | string>(null);
  const [traineeName, setTraineeName] = useState("Trainee");

  const projectedTrainingHours = 40;
  const totalHoursOnJob = [
    "hoursMonday",
    "hoursTuesday",
    "hoursWednesday",
    "hoursThursday",
    "hoursFriday",
  ].reduce((sum, key) => sum + (Number(formData[key]) || 0), 0);
  const totalHoursOffJob = [
    "hoursOffJobMonday",
    "hoursOffJobTuesday",
    "hoursOffJobWednesday",
    "hoursOffJobThursday",
    "hoursOffJobFriday",
  ].reduce((sum, key) => sum + (Number(formData[key]) || 0), 0);
  const totalHoursWithTrainee = [
    "hoursWithTraineeMonday",
    "hoursWithTraineeTuesday",
    "hoursWithTraineeWednesday",
    "hoursWithTraineeThursday",
    "hoursWithTraineeFriday",
  ].reduce((sum, key) => sum + (Number(formData[key]) || 0), 0);
  const totalHours = totalHoursOnJob + totalHoursOffJob;
  const expectedQualified =
    ((totalHoursOnJob / projectedTrainingHours) * 100).toFixed(1) || "0";

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

        if (employee?.employee_name) setTraineeName(employee.employee_name);
        if (weekData) setFormData(weekData);
      } catch {
        Alert.alert("Error", "Failed to load evaluation data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [currentWeek]);

  const handleChange = (key: string, value: string) => {
    let updated = value;

    if (
      ["reTimeAchieved", "yieldAuditDate", "knifeSkillsAuditDate"].includes(key)
    ) {
      updated = value
        .replace(/[^\d]/g, "")
        .slice(0, 8)
        .replace(/(\d{2})(\d{0,2})(\d{0,4})/, (_, a, b, c) =>
          [a, b, c].filter(Boolean).join("/")
        );
    }

    if (
      key.startsWith("hours") ||
      key === "knifeScore" ||
      key === "percentQualified"
    ) {
      updated = updated.replace(/[^\d]/g, "");
    }

    setFormData((prev: any) => ({ ...prev, [key]: updated }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const renderFieldGroup = (title: string, keys: string[]) => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-3">{title}</Text>
      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
        (day, index) => {
          const key = keys[index];
          return (
            <View key={key} className="mb-4">
              <Text className="text-base text-gray-700 mb-2">{day}</Text>
              <TextInput
                value={formData[key]}
                onChangeText={(text) => handleChange(key, text)}
                placeholder="0"
                keyboardType="numeric"
                className={`border ${
                  errors[key] ? "border-red-500" : "border-gray-300"
                } rounded-md px-4 py-3 text-gray-900`}
              />
              {errors[key] && (
                <Text className="text-sm text-red-500 mt-1">{errors[key]}</Text>
              )}
            </View>
          );
        }
      )}
    </View>
  );

  const toggleHandStretch = () => {
    setFormData((prev: any) => ({
      ...prev,
      handStretchCompleted: !prev.handStretchCompleted,
    }));
  };

  const handleSignature = (base64: string) => {
    if (signatureType) {
      setFormData((prev: any) => ({ ...prev, [signatureType]: base64 }));
    }
    setSignatureType(null);
  };

  const handleSubmit = async () => {
    const { newErrors } = useEvaluationsValidation(formData);
    console.log(newErrors);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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
              totalHoursOffJob,
              totalHoursWithTrainee,
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
    } catch {
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
          className="px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() =>
                router.replace(
                  `/users/${id}/folders/${folderId}/files/${fileId}`
                )
              }
              className="mr-3"
            >
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

          {renderFieldGroup("Hours On Job", [
            "hoursMonday",
            "hoursTuesday",
            "hoursWednesday",
            "hoursThursday",
            "hoursFriday",
          ])}

          {renderFieldGroup("Hours Off Job", [
            "hoursOffJobMonday",
            "hoursOffJobTuesday",
            "hoursOffJobWednesday",
            "hoursOffJobThursday",
            "hoursOffJobFriday",
          ])}

          {renderFieldGroup("Hours With Trainee", [
            "hoursWithTraineeMonday",
            "hoursWithTraineeTuesday",
            "hoursWithTraineeWednesday",
            "hoursWithTraineeThursday",
            "hoursWithTraineeFriday",
          ])}

          {[
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
                keyboardType={
                  [
                    "knifeScore",
                    "percentQualified",
                    "reTimeAchieved",
                    "yieldAuditDate",
                    "knifeSkillsAuditDate",
                  ].includes(field.key)
                    ? "numeric"
                    : "default"
                }
                numberOfLines={field.multiline ? 4 : 1}
                className={`border ${
                  errors[field.key] ? "border-red-500" : "border-gray-300"
                } rounded-md px-4 py-3 text-gray-900`}
                style={{
                  textAlignVertical: field.multiline ? "top" : "center",
                }}
              />
              {errors[field.key] && (
                <Text className="text-sm text-red-500 mt-1">
                  {errors[field.key]}
                </Text>
              )}
            </View>
          ))}

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

          {[
            { key: "trainerSignature", signer: currentUser?.name || "Trainer" },
            { key: "teamMemberSignature", signer: traineeName },
            { key: "supervisorSignature", signer: "Supervisor (TBD)" },
          ].map((field) => (
            <View key={field.key} className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {field.signer}
              </Text>
              <TouchableOpacity
                onPress={() => setSignatureType(field.key)}
                className={`rounded-md px-4 py-3 justify-center items-center ${
                  errors[field.key]
                    ? "bg-gray-100 border border-red-500"
                    : "bg-gray-100 border border-gray-300"
                }`}
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
              {errors[field.key] && (
                <Text className="text-sm text-red-500 mt-1">
                  {errors[field.key]}
                </Text>
              )}
            </View>
          ))}

          <View className="mb-6">
            <Text className="text-lg font-medium text-gray-800">
              Total Hours on Job: {totalHoursOnJob}
            </Text>
            <Text className="text-lg font-medium text-gray-800">
              Total Hours Off Job: {totalHoursOffJob}
            </Text>
            <Text className="text-lg font-medium text-gray-800">
              Total Hours With Trainee: {totalHoursWithTrainee}
            </Text>
            <Text className="text-lg font-medium text-gray-800">
              Total Hours: {totalHours}
            </Text>
          </View>

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
