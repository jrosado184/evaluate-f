import React, { useState, useEffect } from "react";
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
import useEmployeeContext from "@/app/context/EmployeeContext";
import useAuthContext from "@/app/context/AuthContext";

const PersonalInfoForm = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // employeeId
  const { employee } = useEmployeeContext();
  const { currentUser } = useAuthContext();

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

  // Prefill from employee context once loaded
  useEffect(() => {
    if (employee) {
      setFormData((prev: any) => ({
        ...prev,
        teamMemberName: employee.employee_name || "",
        employeeId: String(employee?.employee_id) || "",
        lockerNumber: employee.locker_number?.toString() || "",
      }));
      setLoading(false);
    }
  }, [employee]);

  const prefilledFields = ["teamMemberName", "employeeId", "lockerNumber"];

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
    ];
    const errs: Record<string, string> = {};
    for (const key of required) {
      if (!formData[key as keyof typeof formData]?.trim()) {
        errs[key] = "Required";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (key: string, value: string) => {
    let formatted = value;
    // date formatting MM/DD/YYYY
    if (
      key === "hireDate" ||
      key === "jobStartDate" ||
      key === "projectedQualifyingDate"
    ) {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 2) formatted = digits;
      else if (digits.length <= 4)
        formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      else
        formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(
          4,
          8
        )}`;
    }
    // phone formatting (XXX)XXX-XXXX or XXX-XXX-XXXX
    if (key === "phoneNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      if (digits.length <= 3) formatted = digits;
      else if (digits.length <= 6)
        formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      else
        formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
          6
        )}`;
    }
    // numeric-only fields
    if (/[0-9]/.test(key) && !/Date|Number|Phone/.test(key)) {
      formatted = formatted.replace(/\D/g, "");
    }
    setFormData((prev) => ({ ...prev, [key]: formatted }));
    if (errors[key]) {
      const copy = { ...errors };
      delete copy[key];
      setErrors(copy);
    }
  };

  const handleTrainingTypeSelect = (type: string) => {
    handleChange("trainingType", type);
    setMenuVisible(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      const res = await axios.post(
        `${baseUrl}/employees/${id}/evaluations`,
        {
          jobTitle: formData.jobTitle,
          createdBy: currentUser,
          personalInfo: formData,
        },
        { headers: { Authorization: token } }
      );

      // navigate straight to step 2
      const newEvalId = res.data._id;
      router.replace(`/users/${id}/evaluations/${newEvalId}/step2`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not create evaluation.");
    } finally {
      setIsSubmitting(false);
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
              <Menu.Item
                onPress={() => handleTrainingTypeSelect("New Hire")}
                title="New Hire"
              />
              <Menu.Item
                onPress={() => handleTrainingTypeSelect("Bid")}
                title="Bid"
              />
              <Menu.Item
                onPress={() => handleTrainingTypeSelect("Cross Training")}
                title="Cross Training"
              />
            </Menu>
            {errors.trainingType && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.trainingType}
              </Text>
            )}
          </View>

          {/* Other fields */}
          {[
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
          ].map(({ key, label }) => (
            <View key={key} className="mb-5">
              <FormField
                title={label}
                value={formData[key as keyof typeof formData]}
                placeholder={label}
                handleChangeText={(text) => handleChange(key, text)}
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
