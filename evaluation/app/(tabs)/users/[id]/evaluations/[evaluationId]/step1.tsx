// app/(tabs)/users/[id]/evaluations/[evaluationId]/step1.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import { Menu, Button as PaperButton } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuthContext from "@/app/context/AuthContext";
import useEmployeeContext from "@/app/context/EmployeeContext";

const PersonalInfoForm = () => {
  const router = useRouter();
  const { id: employeeId, evaluationId, from } = useLocalSearchParams();
  const { currentUser } = useAuthContext();
  const { employee } = useEmployeeContext();

  const [formData, setFormData] = useState({
    trainingType: "",
    teamMemberName: "",
    employeeId: "",
    hireDate: "",
    jobTitle: "",
    department: "",
    lockerNumber: "",
    phoneNumber: "",
    jobStartDate: "",
    projectedTrainingHours: "",
    projectedQualifyingDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prefilledFields = [
    "teamMemberName",
    "employeeId",
    "lockerNumber",
  ] as const;

  useEffect(() => {
    (async () => {
      try {
        // 1) load saved personalInfo
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        const res = await axios.get(`${baseUrl}/evaluations/${evaluationId}`, {
          headers: { Authorization: token! },
        });
        const info = res.data.personalInfo || {};

        // 2) merge missing fields from employee context
        setFormData({
          trainingType: info.trainingType || "",
          teamMemberName: info.teamMemberName || employee?.employee_name || "",
          employeeId: info.employeeId || String(employee?.employee_id || ""),
          hireDate: info.hireDate || "",
          jobTitle: info.jobTitle || "",
          department: info.department || "",
          lockerNumber:
            info.lockerNumber || String(employee?.locker_number || ""),
          phoneNumber: info.phoneNumber || "",
          jobStartDate: info.jobStartDate || "",
          projectedTrainingHours: info.projectedTrainingHours || "",
          projectedQualifyingDate: info.projectedQualifyingDate || "",
        });
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Could not load saved information.");
      } finally {
        setLoading(false);
      }
    })();
  }, [evaluationId, employee]);

  const validateForm = () => {
    const required = [
      "trainingType",
      "teamMemberName",
      "employeeId",
      "hireDate",
      "jobTitle",
      "department",
      "lockerNumber",
      "jobStartDate",
      "projectedTrainingHours",
      "projectedQualifyingDate",
    ] as const;

    const errs: Record<string, string> = {};
    required.forEach((key) => {
      if (!formData[key].trim()) errs[key] = "Required";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (key: keyof typeof formData, value: string) => {
    let v = value;
    // date mask
    if (/(Date|QualifyingDate)/.test(key)) {
      const d = value.replace(/\D/g, "");
      if (d.length <= 2) v = d;
      else if (d.length <= 4) v = `${d.slice(0, 2)}/${d.slice(2)}`;
      else v = `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`;
    }
    // phone mask
    if (key === "phoneNumber") {
      const d = value.replace(/\D/g, "").slice(0, 10);
      if (d.length <= 3) v = d;
      else if (d.length <= 6) v = `${d.slice(0, 3)}-${d.slice(3)}`;
      else v = `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    }
    // numeric only
    if (/(ID|Hours)/.test(key)) {
      v = v.replace(/\D/g, "");
    }

    setFormData((f) => ({ ...f, [key]: v }));
    if (errors[key]) {
      const e2 = { ...errors };
      delete e2[key];
      setErrors(e2);
    }
  };

  const handleTrainingTypeSelect = (t: string) => {
    handleChange("trainingType", t);
    setMenuVisible(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      // PATCH personalInfo
      await axios.patch(
        `${baseUrl}/evaluations/${evaluationId}`,
        {
          action: "update_personal_info",
          data: { personalInfo: formData },
        },
        { headers: { Authorization: token! } }
      );

      // bump status if new
      if (from !== "details") {
        await axios.patch(
          `${baseUrl}/evaluations/${evaluationId}`,
          {
            action: "update_status",
            data: { status: "in_progress" },
          },
          { headers: { Authorization: token! } }
        );
      }

      // navigate to step2
      router.replace(`/users/${employeeId}/evaluations/${evaluationId}/step2`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1a237e" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Back + Title */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Icon name="chevron-left" size={28} color="#1a237e" />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold text-gray-900">
              Personal Information
            </Text>
          </View>

          {/* Training Type */}
          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Training Type
            </Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <PaperButton
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={{
                    borderColor: errors.trainingType ? "#ef4444" : "#d1d5db",
                    borderWidth: 1,
                    height: 50,
                    justifyContent: "center",
                    borderRadius: 8,
                  }}
                  labelStyle={{
                    color: formData.trainingType ? "#111827" : "#6b7280",
                    fontSize: 16,
                    textAlign: "left",
                  }}
                >
                  {formData.trainingType || "Select Training Type"}
                </PaperButton>
              }
            >
              {["New Hire", "Bid", "Cross Training"].map((opt) => (
                <Menu.Item
                  key={opt}
                  title={opt}
                  onPress={() => handleTrainingTypeSelect(opt)}
                />
              ))}
            </Menu>
            {errors.trainingType && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.trainingType}
              </Text>
            )}
          </View>

          {/* Other fields */}
          {(
            [
              { key: "teamMemberName", label: "Team Member Name" },
              { key: "employeeId", label: "Employee ID" },
              { key: "hireDate", label: "Hire Date (MM/DD/YYYY)" },
              { key: "jobTitle", label: "Job Title" },
              { key: "department", label: "Department" },
              { key: "lockerNumber", label: "Locker #" },
              { key: "phoneNumber", label: "Phone Number" },
              { key: "jobStartDate", label: "Job Start Date (MM/DD/YYYY)" },
              {
                key: "projectedTrainingHours",
                label: "Projected Training Hours",
              },
              {
                key: "projectedQualifyingDate",
                label: "Projected Qualifying Date (MM/DD/YYYY)",
              },
            ] as const
          ).map(({ key, label }) => (
            <View key={key} className="mb-5">
              <FormField
                title={label}
                value={formData[key]}
                placeholder={label}
                handleChangeText={(t) => handleChange(key, t)}
                error={errors[key]}
                keyboardType={
                  /Date|Hours|ID|Number|Phone/.test(key) ? "numeric" : "default"
                }
                editable={!prefilledFields.includes(key)}
              />
            </View>
          ))}

          <Button
            title="Save and Continue"
            handlePress={handleSubmit}
            isLoading={isSubmitting}
            styles="mt-6"
            inputStyles="bg-[#1a237e] w-full"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PersonalInfoForm;
