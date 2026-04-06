import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SinglePressTouchable from "./utils/SinglePress";
import useAuthContext from "./context/AuthContext";
import { getAvatarMeta } from "./helpers/avatar";
import getServerIP from "./requests/NetworkAddress";
import ManageUserAccess from "@/components/admin/ManageUserAccess";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry: boolean;
  onToggle: () => void;
};

const PasswordField = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  onToggle,
}: PasswordFieldProps) => {
  return (
    <View className="rounded-[1rem] bg-neutral-50 border border-neutral-200 px-4 py-3">
      <Text className="text-[0.78rem] font-inter-medium text-neutral-500 mb-2">
        {label}
      </Text>

      <View className="flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#A3A3A3"
          className="flex-1 text-[0.98rem] font-inter-semibold text-neutral-900"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <SinglePressTouchable onPress={onToggle} className="ml-3">
          <Icon
            name={secureTextEntry ? "eye-off" : "eye"}
            size={18}
            color="#737373"
          />
        </SinglePressTouchable>
      </View>
    </View>
  );
};

const Profile = () => {
  const { currentUser, logout } = useAuthContext();

  const normalizedRole = useMemo(() => {
    const rawRole = currentUser?.role;

    if (typeof rawRole === "string") {
      return rawRole;
    }

    if (rawRole && typeof rawRole === "object") {
      if (typeof rawRole.role === "string") return rawRole.role;
      if (typeof rawRole.name === "string") return rawRole.name;
      if (typeof rawRole.label === "string") return rawRole.label;
    }

    return "";
  }, [currentUser?.role]);

  const { initials, bg, text } = getAvatarMeta(currentUser?.name || "");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isAdmin = normalizedRole.toLowerCase() === "admin";

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/sign-in");
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      Alert.alert("Missing Fields", "Please complete all password fields.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert(
        "Mismatch",
        "New password and confirm password do not match.",
      );
      return;
    }

    if (passwords.newPassword.length < 8) {
      Alert.alert(
        "Weak Password",
        "New password should be at least 8 characters long.",
      );
      return;
    }

    Alert.alert(
      "Change Password",
      "Are you sure you want to change your password?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const baseUrl = await getServerIP();

              const res = await axios.patch(
                `${baseUrl}/auth/change-password`,
                {
                  currentPassword: passwords.currentPassword,
                  newPassword: passwords.newPassword,
                  confirmPassword: passwords.confirmPassword,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              Alert.alert(
                "Success",
                res.data?.message || "Password updated successfully.",
              );

              setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.response?.data?.message || "Failed to update password.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <SinglePressTouchable
          onPress={() => router.back()}
          className="flex-row items-center self-start rounded-full px-3 py-2 bg-white border border-neutral-200"
        >
          <Icon name="chevron-left" size={20} color="#171717" />
          <Text className="ml-1 text-[0.95rem] font-inter-semibold text-neutral-900">
            Back
          </Text>
        </SinglePressTouchable>

        <View className="pt-8">
          <View className="gap-5">
            <View className="bg-white rounded-[1.5rem] border border-neutral-200 px-5 py-7 items-center shadow-sm">
              <View
                className={`w-28 h-28 rounded-full items-center justify-center border border-neutral-200 ${bg}`}
              >
                <Text
                  className={`text-[2.1rem] font-inter-bold tracking-[0.5px] ${text}`}
                >
                  {initials}
                </Text>
              </View>

              <View className="items-center mt-5">
                <Text className="text-[1.35rem] font-inter-semibold text-neutral-900">
                  {currentUser?.name || "User"}
                </Text>

                <View className="mt-2 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200">
                  <Text className="text-[0.9rem] font-inter-medium text-neutral-600 capitalize">
                    {normalizedRole || "No role"}
                  </Text>
                </View>
              </View>

              <View className="w-full mt-7 gap-3">
                <View className="rounded-[1rem] bg-neutral-50 border border-neutral-200 px-4 py-4">
                  <Text className="text-[0.78rem] font-inter-medium text-neutral-500 mb-1">
                    Email
                  </Text>
                  <Text className="text-[0.98rem] font-inter-semibold text-neutral-900">
                    {currentUser?.email || "-"}
                  </Text>
                </View>

                <View className="rounded-[1rem] bg-neutral-50 border border-neutral-200 px-4 py-4">
                  <Text className="text-[0.78rem] font-inter-medium text-neutral-500 mb-1">
                    Employee ID
                  </Text>
                  <Text className="text-[0.98rem] font-inter-semibold text-neutral-900">
                    {currentUser?.employee_id || "-"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white rounded-[1.5rem] border border-neutral-200 px-5 py-6 shadow-sm">
              <View className="flex-row items-center mb-4">
                <Icon name="lock" size={18} color="#171717" />
                <Text className="ml-2 text-[1rem] font-inter-semibold text-neutral-900">
                  Change Password
                </Text>
              </View>

              <View className="gap-3">
                <PasswordField
                  label="Current Password"
                  value={passwords.currentPassword}
                  onChangeText={(text) =>
                    setPasswords((prev) => ({ ...prev, currentPassword: text }))
                  }
                  secureTextEntry={!showCurrentPassword}
                  onToggle={() => setShowCurrentPassword((prev) => !prev)}
                />

                <PasswordField
                  label="New Password"
                  value={passwords.newPassword}
                  onChangeText={(text) =>
                    setPasswords((prev) => ({ ...prev, newPassword: text }))
                  }
                  secureTextEntry={!showNewPassword}
                  onToggle={() => setShowNewPassword((prev) => !prev)}
                />

                <PasswordField
                  label="Confirm Password"
                  value={passwords.confirmPassword}
                  onChangeText={(text) =>
                    setPasswords((prev) => ({ ...prev, confirmPassword: text }))
                  }
                  secureTextEntry={!showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((prev) => !prev)}
                />
              </View>

              <SinglePressTouchable
                onPress={handleChangePassword}
                className="mt-5 bg-neutral-900 rounded-[1rem] py-4 items-center justify-center"
              >
                <Text className="text-white text-[0.98rem] font-inter-semibold">
                  Update Password
                </Text>
              </SinglePressTouchable>
            </View>

            {isAdmin && <ManageUserAccess />}

            <SinglePressTouchable
              onPress={handleLogout}
              className="bg-white border border-red-200 rounded-[1rem] py-4 items-center justify-center"
            >
              <Text className="text-red-600 text-[1rem] font-inter-semibold">
                Logout
              </Text>
            </SinglePressTouchable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
