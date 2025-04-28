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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios"; // 🆕 added
import getServerIP from "@/app/requests/NetworkAddress";

const Step2Form = ({ onNext }: { onNext: () => void }) => {
  const router = useRouter();
  const { id, fileId, folderId } = useLocalSearchParams();

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

  console.log(fileId);

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const toggleHandStretch = () => {
    setFormData((prev: any) => ({
      ...prev,
      handStretchCompleted: !prev.handStretchCompleted,
    }));
  };

  const handleSubmit = async () => {
    try {
      const evaluationData = {
        weekNumber: 1, // 🛑 Hardcoded Week 1 for now
        hoursMonday: formData.hoursMonday,
        hoursTuesday: formData.hoursTuesday,
        hoursWednesday: formData.hoursWednesday,
        hoursThursday: formData.hoursThursday,
        hoursFriday: formData.hoursFriday,
        hoursOffJob: formData.hoursOffJob,
        totalHours,
        totalHoursOnJob,
        percentQualified: formData.percentQualified,
        expectedQualified: formData.expectedQualified,
        reTimeAchieved: formData.reTimeAchieved,
        yieldAuditDate: formData.yieldAuditDate,
        knifeSkillsAuditDate: formData.knifeSkillsAuditDate,
        knifeScore: formData.knifeScore,
        handStretchCompleted: formData.handStretchCompleted,
        comments: formData.comments,
        trainerSignature: formData.trainerSignature,
        traineeSignature: formData.teamMemberSignature,
        supervisorSignature: formData.supervisorSignature,
      };
      const baseUrl = await getServerIP();
      await axios.patch(
        `${baseUrl}/employees/${id}/folders/${folderId}/files/${fileId}/evaluations`,
        evaluationData
      );

      console.log("✅ Evaluation saved successfully");

      router.replace(`/users/${id}/folders/files/${fileId}`);
    } catch (error: any) {
      console.error(
        "Error saving evaluation:",
        error.response?.data || error.message
      );
      alert("Failed to save evaluation.");
    }
  };

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
              onPress={() =>
                router.push({
                  pathname: `/users/${id}/folders/files/${fileId}/edit-form`,
                  params: { step: "1", folderId },
                })
              }
              style={{ marginRight: 12 }}
            >
              <Icon name="chevron-left" size={28} color="#1a237e" />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: "600", color: "#111827" }}>
              1st Week Information
            </Text>
          </View>

          {/* Hours Monday–Friday */}
          {[
            { label: "Hours on Job - Monday", key: "hoursMonday" },
            { label: "Hours on Job - Tuesday", key: "hoursTuesday" },
            { label: "Hours on Job - Wednesday", key: "hoursWednesday" },
            { label: "Hours on Job - Thursday", key: "hoursThursday" },
            { label: "Hours on Job - Friday", key: "hoursFriday" },
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
                keyboardType="numeric"
                value={formData[field.key]}
                onChangeText={(text) => handleChange(field.key, text)}
                style={{
                  borderColor: "#d1d5db",
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: "#111827",
                }}
              />
            </View>
          ))}

          {/* Hours Off Job */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Hours Off Job
            </Text>
            <TextInput
              placeholder="Hours Off Job"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={formData.hoursOffJob}
              onChangeText={(text) => handleChange("hoursOffJob", text)}
              style={{
                borderColor: "#d1d5db",
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: "#111827",
              }}
            />
          </View>

          {/* Totals */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Total Hours
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              {totalHours}
            </Text>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Total Hours on Job
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              {totalHoursOnJob}
            </Text>
          </View>

          {/* Other fields */}
          {[
            { label: "Percent Qualified (%)", key: "percentQualified" },
            { label: "RE Time Achieved (ex: 10 secs)", key: "reTimeAchieved" },
            {
              label: "Yield/Specification Quality Audit Date (MM/DD/YYYY)",
              key: "yieldAuditDate",
            },
            {
              label: "Knife Skills Audit Date (MM/DD/YYYY)",
              key: "knifeSkillsAuditDate",
            },
            { label: "Knife Score (%)", key: "knifeScore" },
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
                onChangeText={(text) => handleChange(field.key, text)}
                style={{
                  borderColor: "#d1d5db",
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: "#111827",
                }}
              />
            </View>
          ))}

          {/* Hand Stretch Toggle */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Hand Stretch Exercises Completed
            </Text>
            <TouchableOpacity
              onPress={toggleHandStretch}
              activeOpacity={0.8}
              style={{
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor: formData.handStretchCompleted
                  ? "#10b981"
                  : "#d1d5db",
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "#ffffff" }}
              >
                {formData.handStretchCompleted ? "Yes" : "No"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comments */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Comments
            </Text>
            <TextInput
              placeholder="Enter comments..."
              placeholderTextColor="#6b7280"
              value={formData.comments}
              onChangeText={(text) => handleChange("comments", text)}
              multiline
              numberOfLines={4}
              style={{
                borderColor: "#d1d5db",
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: "#111827",
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Signatures */}
          {[
            { label: "Trainer Signature", key: "trainerSignature" },
            { label: "Team Member Signature", key: "teamMemberSignature" },
            { label: "Supervisor Signature", key: "supervisorSignature" },
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
                onChangeText={(text) => handleChange(field.key, text)}
                style={{
                  borderColor: "#d1d5db",
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: "#111827",
                }}
              />
            </View>
          ))}

          {/* Save and Continue */}
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

export default Step2Form;
