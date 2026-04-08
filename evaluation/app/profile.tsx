import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useAuthContext from "./context/AuthContext";
import getServerIP from "./requests/NetworkAddress";
import ManageUserAccess from "@/components/admin/ManageUserAccess";
import SinglePressTouchable from "./utils/SinglePress";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSummaryCard from "@/components/profile/ProfileSummaryCard";
import ChangePasswordCard from "@/components/profile/ChangePasswordCard";

const Profile = () => {
  const { currentUser, logout } = useAuthContext();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeTablet = width >= 1100;
  const maxWidth = isLargeTablet ? 1180 : isTablet ? 980 : 680;

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
    <SafeAreaView className="flex-1 bg-[#F3F5F8]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="self-center w-full" style={{ maxWidth }}>
          <ProfileHeader />

          <View className="gap-5">
            <ProfileSummaryCard
              name={currentUser?.name}
              email={currentUser?.email}
              employeeId={currentUser?.employee_id}
              role={normalizedRole}
            />

            <ChangePasswordCard
              passwords={passwords}
              setPasswords={setPasswords}
              showCurrentPassword={showCurrentPassword}
              setShowCurrentPassword={setShowCurrentPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              onSubmit={handleChangePassword}
            />

            {isAdmin ? (
              <View
                className="rounded-[24px] bg-white p-5"
                style={{
                  borderWidth: 1,
                  borderColor: "#E3E8EF",
                  shadowColor: "#0F172A",
                  shadowOpacity: 0.03,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 1,
                }}
              >
                <ManageUserAccess />
              </View>
            ) : null}

            <SinglePressTouchable
              onPress={handleLogout}
              className="items-center justify-center rounded-[18px] bg-white py-4"
              style={{
                borderWidth: 1,
                borderColor: "#FECACA",
              }}
            >
              <Text className="text-[15px] font-semibold text-red-600">
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
