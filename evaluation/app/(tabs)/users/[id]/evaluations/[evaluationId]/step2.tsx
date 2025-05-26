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
import { SafeAreaView } from "react-native-safe-area-context";

const Step2Form = () => {
  const router = useRouter();
  const { id: employeeId, evaluationId, week, step } = useLocalSearchParams();
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
    hasPain: false,
    comments: "",
    trainerSignature: "",
    teamMemberSignature: "",
    supervisorSignature: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [signatureType, setSignatureType] = useState<null | string>(null);
  const [traineeName, setTraineeName] = useState("Trainee");

  // precompute totals & expectedQualified
  const projectedTrainingHours = 40;
  const sum = (keys: string[]) =>
    keys.reduce((acc, k) => acc + (Number(formData[k]) || 0), 0);
  const totalHoursOnJob = sum([
    "hoursMonday",
    "hoursTuesday",
    "hoursWednesday",
    "hoursThursday",
    "hoursFriday",
  ]);
  const totalHoursOffJob = sum([
    "hoursOffJobMonday",
    "hoursOffJobTuesday",
    "hoursOffJobWednesday",
    "hoursOffJobThursday",
    "hoursOffJobFriday",
  ]);
  const totalHoursWithTrainee = sum([
    "hoursWithTraineeMonday",
    "hoursWithTraineeTuesday",
    "hoursWithTraineeWednesday",
    "hoursWithTraineeThursday",
    "hoursWithTraineeFriday",
  ]);
  const totalHours = totalHoursOnJob + totalHoursOffJob;
  const computedExpected = (
    (totalHoursOnJob / projectedTrainingHours) *
    100
  ).toFixed(1);

  // keep expectedQualified in sync
  useEffect(() => {
    setFormData((f: any) => ({ ...f, expectedQualified: computedExpected }));
  }, [
    formData.hoursMonday,
    formData.hoursTuesday,
    formData.hoursWednesday,
    formData.hoursThursday,
    formData.hoursFriday,
  ]);

  // fetch single evaluation
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        const res = await axios.get(`${baseUrl}/evaluations/${evaluationId}`, {
          headers: { Authorization: token! },
        });
        const evalDoc = res.data;
        setTraineeName(evalDoc.personalInfo.teamMemberName || "Trainee");
        const weekData = evalDoc.evaluations.find(
          (e: any) => e.weekNumber === currentWeek
        );
        if (weekData) setFormData(weekData);
      } catch {
        Alert.alert("Error", "Failed to load evaluation");
      } finally {
        setLoading(false);
      }
    })();
  }, [evaluationId, currentWeek]);

  const handleChange = (key: string, value: string) => {
    let v = value;
    if (["yieldAuditDate", "knifeSkillsAuditDate"].includes(key)) {
      v = v
        .replace(/\D/g, "")
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
      v = v.replace(/\D/g, "");
    }
    setFormData((f) => ({ ...f, [key]: v }));
    if (errors[key]) {
      setErrors((e) => {
        const c = { ...e };
        delete c[key];
        return c;
      });
    }
  };

  const { newErrors } = useEvaluationsValidation(formData);

  const handleSubmit = async () => {
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      // 1) add or update this week
      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        {
          action: "add_or_update_week",
          data: {
            weekData: {
              ...formData,
              weekNumber: currentWeek,
              totalHours,
              totalHoursOnJob,
              totalHoursOffJob,
              totalHoursWithTrainee,
            },
          },
        },
        { headers: { Authorization: token! } }
      );

      // 2) bump status
      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        {
          action: "update_status",
          data: { status: "in_progress" },
        },
        { headers: { Authorization: token! } }
      );

      // 3) navigate back to summary
      router.replace(`/users/${employeeId}/evaluations/${evaluationId}`);
    } catch {
      Alert.alert("Error", "Failed to save evaluation");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  const renderFieldGroup = (title: string, keys: string[]) => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-3">{title}</Text>
      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
        (day, i) => {
          const key = keys[i];
          return (
            <View key={key} className="mb-4">
              <Text className="text-base text-gray-700 mb-2">{day}</Text>
              <TextInput
                value={formData[key]}
                onChangeText={(t) => handleChange(key, t)}
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

  return (
    <SafeAreaView className="flex-1 bg-white">
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
          {/* Back + Title */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() =>
                router.replace(
                  `/users/${employeeId}/evaluations/${evaluationId}`
                )
              }
              className="mr-3"
            >
              <Icon name="chevron-left" size={28} color="#1a237e" />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold text-gray-900">
              {`${currentWeek}${
                ["st", "nd", "rd"][currentWeek - 1] || "th"
              } Week`}
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
          {renderFieldGroup("Hours with Trainee", [
            "hoursWithTraineeMonday",
            "hoursWithTraineeTuesday",
            "hoursWithTraineeWednesday",
            "hoursWithTraineeThursday",
            "hoursWithTraineeFriday",
          ])}

          {/* other metrics */}
          {[
            { label: "Percent Qualified (%)", key: "percentQualified" },
            { label: "RE Time (s)", key: "reTimeAchieved" },
            { label: "Yield Audit Date", key: "yieldAuditDate" },
            { label: "Knife Audit Date", key: "knifeSkillsAuditDate" },
            { label: "Knife Score (%)", key: "knifeScore" },
            { label: "Comments", key: "comments", multiline: true },
          ].map((f) => (
            <View key={f.key} className="mb-5">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {f.label}
              </Text>
              <TextInput
                value={formData[f.key]}
                onChangeText={(t) => handleChange(f.key, t)}
                placeholder={f.label}
                multiline={!!f.multiline}
                keyboardType={
                  ["percentQualified", "reTimeAchieved", "knifeScore"].includes(
                    f.key
                  )
                    ? "numeric"
                    : "default"
                }
                className={`border ${
                  errors[f.key] ? "border-red-500" : "border-gray-300"
                } rounded-md px-4 py-3 text-gray-900`}
                style={{ textAlignVertical: f.multiline ? "top" : "center" }}
                numberOfLines={f.multiline ? 4 : 1}
              />
              {errors[f.key] && (
                <Text className="text-sm text-red-500 mt-1">
                  {errors[f.key]}
                </Text>
              )}
            </View>
          ))}

          {/* toggles */}
          {["hasPain", "handStretchCompleted"].map((k) => (
            <View key={k} className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {k === "hasPain"
                  ? "Any pain/numbness?"
                  : "Hand Stretch Exercises Completed"}
              </Text>
              <TouchableOpacity
                onPress={() => setFormData((f: any) => ({ ...f, [k]: !f[k] }))}
                className={`py-3 rounded-md items-center ${
                  k === "hasPain"
                    ? formData.hasPain
                      ? "bg-red-600"
                      : "bg-green-600"
                    : formData.handStretchCompleted
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                <Text className="text-white text-lg font-semibold">
                  {formData[k] ? "Yes" : "No"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* signatures */}
          {[
            { key: "trainerSignature", label: currentUser.name },
            { key: "teamMemberSignature", label: traineeName },
            { key: "supervisorSignature", label: "Supervisor" },
          ].map((s) => (
            <View key={s.key} className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {s.label}
              </Text>
              <TouchableOpacity
                onPress={() => setSignatureType(s.key)}
                className={`rounded-md px-4 py-3 justify-center items-center ${
                  errors[s.key]
                    ? "bg-gray-100 border border-red-500"
                    : "bg-gray-100 border border-gray-300"
                }`}
              >
                {formData[s.key] ? (
                  <Image
                    source={{ uri: formData[s.key] }}
                    className="w-full h-28"
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-gray-500">Tap to sign</Text>
                )}
              </TouchableOpacity>
              {errors[s.key] && (
                <Text className="text-sm text-red-500 mt-1">
                  {errors[s.key]}
                </Text>
              )}
            </View>
          ))}

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            className="bg-[#1a237e] py-4 rounded-md items-center"
          >
            <Text className="text-white text-lg font-semibold">
              Save & Continue
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <SignatureModal
        visible={!!signatureType}
        onOK={(base64: string) => {
          setFormData((f: any) => ({ ...f, [signatureType!]: base64 }));
          setSignatureType(null);
        }}
        onCancel={() => setSignatureType(null)}
      />
    </SafeAreaView>
  );
};

export default Step2Form;
