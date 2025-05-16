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

const PersonalInfoForm = ({ onNext }: { onNext?: () => void }) => {
  const router = useRouter();
  const { id, fileId, folderId, from } = useLocalSearchParams();

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

  const prefilledFields = [
    "teamMemberName",
    "employeeId",
    "jobTitle",
    "department",
    "lockerNumber",
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();
        const res = await axios.get(`${baseUrl}/employees/${id}`, {
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
          Alert.alert("Error", "File not found.");
          return;
        }

        if (foundFile.personalInfo) {
          setFormData((prev) => ({
            ...prev,
            ...foundFile.personalInfo,
          }));
        }
      } catch (err) {
        Alert.alert("Error", "Could not load file data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFileData();
  }, []);

  const handleChange = (key: string, value: string) => {
    let formattedValue = value;

    if (
      key === "hireDate" ||
      key === "jobStartDate" ||
      key === "projectedQualifyingDate"
    ) {
      formattedValue = formattedValue.replace(/\D/g, "");
      if (formattedValue.length <= 2) {
        // month only
      } else if (formattedValue.length <= 4) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(
          2
        )}`;
      } else {
        formattedValue =
          `${formattedValue.slice(0, 2)}/` +
          `${formattedValue.slice(2, 4)}/` +
          `${formattedValue.slice(4, 8)}`;
      }
    }

    if (key === "phoneNumber") {
      const digits = formattedValue.replace(/\D/g, "").slice(0, 10);
      if (digits.length === 0) {
        formattedValue = "";
      } else if (digits.length <= 3) {
        formattedValue = `(${digits}`;
      } else if (digits.length <= 6) {
        formattedValue = `(${digits.slice(0, 3)})-${digits.slice(3)}`;
      } else {
        formattedValue =
          `(${digits.slice(0, 3)})-` +
          `${digits.slice(3, 6)}-` +
          `${digits.slice(6)}`;
      }
    }

    if (
      key === "projectedTrainingHours" ||
      key === "employeeId" ||
      key === "lockerNumber"
    ) {
      formattedValue = formattedValue.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [key]: formattedValue,
    }));

    if (errors[key]) {
      const copy = { ...errors };
      delete copy[key];
      setErrors(copy);
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

      // Only update status if it's incomplete
      if (from !== "details") {
        await axios.patch(
          `${baseUrl}/employees/${id}/folders/${folderId}/files/${fileId}`,
          {
            action: "update_status",
            data: { status: "in_progress" },
          }
        );
      }

      if (from === "details") {
        // Return to FileDetailsScreen and pass updated fields
        router.replace({
          pathname: `/users/${id}/folders/${folderId}/files/${fileId}`,
          params: {
            updated: "true",
            trainingType: formData.trainingType,
            phoneNumber: formData.phoneNumber,
            jobStartDate: formData.jobStartDate,
            projectedTrainingHours: formData.projectedTrainingHours,
            projectedQualifyingDate: formData.projectedQualifyingDate,
          },
        });
      } else {
        // Onboarding flow, go to Step 2
        router.push(
          `/users/${id}/folders/${folderId}/files/${fileId}/edit-form?step=2`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save personal information.");
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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Back and title */}
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

          {/* Fields */}
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
                  key === "lockerNumber" ||
                  key === "phoneNumber"
                    ? "numeric"
                    : "default"
                }
                optional={false}
                editable={!prefilledFields.includes(key)}
              />
            </View>
          ))}

          <Button
            title="Save and Continue"
            handlePress={handleSubmit}
            styles="mt-6"
            inputStyles="bg-[#1a237e] w-full"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PersonalInfoForm;
