import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import { Menu, Button } from "react-native-paper";
import axios from "axios";
import getServerIP from "@/app/requests/NetworkAddress";
import useEmployeeContext from "@/app/context/EmployeeContext";
import FormField from "@/components/FormField";
import Error from "@/components/ErrorText";

const PersonalInfoForm = ({ onNext }: { onNext: () => void }) => {
  const { employee } = useEmployeeContext();
  const router = useRouter();
  const { id, fileId, folderId } = useLocalSearchParams();

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

  const prefilledFields = [
    "teamMemberName",
    "employeeId",
    "jobTitle",
    "department",
    "lockerNumber",
  ];

  useEffect(() => {
    if (employee) {
      setFormData((prev) => ({
        ...prev,
        teamMemberName: employee?.employee_name || "",
        employeeId: String(employee?.employee_id) || "",
        jobTitle: employee?.position || "",
        department: employee?.department || "",
        lockerNumber: String(employee?.locker_number) || "",
      }));
    }
  }, [employee]);

  const handleChange = (key: string, value: string) => {
    let formattedValue = value;

    if (
      key === "hireDate" ||
      key === "jobStartDate" ||
      key === "projectedQualifyingDate"
    ) {
      formattedValue = formattedValue.replace(/[^\d]/g, "");
      if (formattedValue.length > 2 && formattedValue.length <= 4) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(
          2
        )}`;
      } else if (formattedValue.length > 4) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(
          2,
          4
        )}/${formattedValue.slice(4, 8)}`;
      }
    }

    if (
      key === "projectedTrainingHours" ||
      key === "employeeId" ||
      key === "lockerNumber"
    ) {
      formattedValue = formattedValue.replace(/[^\d]/g, "");
    }

    setFormData((prev) => ({ ...prev, [key]: formattedValue }));

    // Clear error when fixed
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const requiredFields = [
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

    const newErrors: Record<string, string> = {};

    requiredFields.forEach((key) => {
      if (!formData[key as keyof typeof formData]) {
        newErrors[key] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTrainingTypeSelect = (type: string) => {
    handleChange("trainingType", type);
    setMenuVisible(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const baseUrl = await getServerIP();

      await axios.patch(
        `${baseUrl}/employees/${id}/folders/${folderId}/files/${fileId}`,
        {
          action: "update_personal_info",
          data: { personalInfo: formData },
        }
      );

      await axios.patch(
        `${baseUrl}/employees/${id}/folders/${folderId}/files/${fileId}`,
        {
          action: "update_status",
          data: { status: "in_progress" },
        }
      );

      onNext();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save personal information.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 120 }} // increased to prevent keyboard overlap
        >
          {/* Back and title */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.push(`/users/${id}/folders/${folderId}`)}
              className="mr-3"
            >
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
                <Button
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
                </Button>
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

          {/* All fields */}
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
            <View key={key} className=" mb-5">
              <FormField
                error={errors[key]}
                title={label}
                value={formData[key as keyof typeof formData]}
                placeholder={label}
                handleChangeText={(text: string) => handleChange(key, text)}
                styles=""
                rounded="rounded-md"
                keyboardType={
                  key.includes("Date") ||
                  key === "projectedTrainingHours" ||
                  key === "employeeId" ||
                  key === "lockerNumber"
                    ? "numeric"
                    : "default"
                }
                optional={false}
                editable={!prefilledFields.includes(key)}
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            className="bg-[#1a237e] py-4 rounded-md items-center mt-6"
          >
            <Text className="text-white text-lg font-semibold">
              Save and Continue
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PersonalInfoForm;
