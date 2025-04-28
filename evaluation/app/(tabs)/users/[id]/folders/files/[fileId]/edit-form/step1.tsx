import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Menu, Button } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";
import getServerIP from "@/app/requests/NetworkAddress";
import useEmployeeContext from "@/app/context/EmployeeContext";

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

  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData((prev) => ({
        ...prev,
        teamMemberName: employee?.employee_name || "",
        employeeId: String(employee?.employee_id) || "",
        jobTitle: employee?.position || "",
        department: employee?.department || "",
        lockerNumber: String(employee?.locker_number) || "",
        phoneNumber: "",
      }));
    }
  }, [employee]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTrainingTypeSelect = (type: string) => {
    handleChange("trainingType", type);
    setMenuVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const baseUrl = await getServerIP();
      await axios.patch(
        `${baseUrl}/employees/${id}/folders/${folderId}/files/${fileId}/personal-info`,
        formData
      );

      console.log("✅ Personal Info Submitted:", formData);

      router.push({
        pathname: `/users/${id}/folders/files/${fileId}/edit-form`,
        params: {
          step: "2",
          fileId: fileId as string,
          folderId: folderId as string,
        },
      });
      onNext();
    } catch (error) {
      console.error("Personal info submit error:", error);
      Alert.alert("Error", "Failed to save personal information.");
    }
  };

  const prefilledFields = [
    "teamMemberName",
    "employeeId",
    "jobTitle",
    "department",
    "lockerNumber",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 90,
            paddingTop: Platform.OS === "ios" ? 10 : 20,
          }}
        >
          {/* Back Button and Title */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push(`/users/${id}/folders/${folderId}`)}
              style={{ marginRight: 12 }}
            >
              <Icon name="chevron-left" size={28} color="#1a237e" />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: "600", color: "#111827" }}>
              Personal Information
            </Text>
          </View>

          {/* Training Type */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 8,
              }}
            >
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
                    borderColor: "#d1d5db",
                    borderWidth: 1,
                    height: 52,
                    justifyContent: "center",
                    borderRadius: 8,
                  }}
                  labelStyle={{
                    color: formData.trainingType ? "#111827" : "#6b7280",
                    fontSize: 16,
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
          </View>

          {/* Form Inputs */}
          {[
            { label: "Team Member Name", key: "teamMemberName" },
            { label: "Employee ID", key: "employeeId" },
            { label: "Hire Date (MM/DD/YYYY)", key: "hireDate" },
            { label: "Job Title", key: "jobTitle" },
            { label: "Department", key: "department" },
            { label: "Locker #", key: "lockerNumber" },
            { label: "Phone Number", key: "phoneNumber" },
            { label: "Job Start Date (MM/DD/YYYY)", key: "jobStartDate" },
            {
              label: "Projected Training Hours",
              key: "projectedTrainingHours",
            },
            {
              label: "Projected Qualifying Date (MM/DD/YYYY)",
              key: "projectedQualifyingDate",
            },
          ].map((field) => (
            <View key={field.key} style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                {field.label}
              </Text>
              <TextInput
                placeholder={field.label}
                placeholderTextColor="#6b7280"
                value={formData[field.key]}
                editable={!prefilledFields.includes(field.key)}
                onChangeText={(text) => handleChange(field.key, text)}
                style={{
                  borderColor: "#d1d5db",
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: prefilledFields.includes(field.key)
                    ? "#9ca3af"
                    : "#111827",
                  backgroundColor: prefilledFields.includes(field.key)
                    ? "#f9fafb"
                    : "#ffffff",
                }}
              />
            </View>
          ))}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#1a237e",
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "600" }}>
              Save and Continue
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PersonalInfoForm;
