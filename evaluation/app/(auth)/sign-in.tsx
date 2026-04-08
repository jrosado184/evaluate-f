import React, { useState } from "react";
import {
  View,
  ScrollView,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "../requests/NetworkAddress";
import useAuthContext from "../context/AuthContext";

const SignIn = () => {
  const [form, setForm] = useState({
    employee_id: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    employee_id: "",
    password: "",
    invalidCredential: "",
  });

  const [isSigningIn, setIsSigningIn] = useState(false);
  const { setCurrentUser } = useAuthContext();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeTablet = width >= 1100;

  const contentWidth = isLargeTablet ? 540 : isTablet ? 500 : width * 0.9;

  const submit = async () => {
    setIsSigningIn(true);
    setErrors({
      employee_id: "",
      password: "",
      invalidCredential: "",
    });

    try {
      const baseUrl = await getServerIP();
      const url = `${baseUrl}/auth/login`;

      const res = await axios.post(url, {
        employee_id: form.employee_id,
        password: form.password,
      });

      const user = res.data;

      setCurrentUser(user);
      await AsyncStorage.setItem("currentUser", JSON.stringify(user));
      await AsyncStorage.setItem("token", user.token);

      if (res.status === 200) {
        router.replace("/home");
      }
    } catch (error: any) {
      const { employee_id, password, message } = error?.response?.data || {};

      setErrors({
        employee_id: employee_id || "",
        password: password || "",
        invalidCredential:
          !employee_id && !password ? message || "Login failed" : "",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5F8]">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        <View className="flex-1 items-center justify-center">
          <View style={{ width: contentWidth }} className="items-center">
            <Image
              resizeMode="contain"
              source={require("../../constants/icons/logo.png")}
              style={{
                width: isTablet ? 240 : 180,
                height: isTablet ? 72 : 56,
                marginBottom: isTablet ? 22 : 24,
              }}
            />

            <View
              className="w-full rounded-[28px] bg-white px-5 py-7"
              style={{
                borderWidth: 1,
                borderColor: "#DDE3EA",
                shadowColor: "#0F172A",
                shadowOpacity: 0.035,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 4 },
                elevation: 1,
              }}
            >
              <View className="mb-6 items-center">
                <View
                  className="rounded-full bg-[#F5F9FF] px-3 py-1.5"
                  style={{
                    borderWidth: 1,
                    borderColor: "#D7E6FF",
                  }}
                >
                  <View className="flex-row items-center">
                    <View className="mr-2 h-2 w-2 rounded-full bg-[#2563EB]" />
                    <Text className="text-[11px] font-medium text-[#2563EB]">
                      Secure Access
                    </Text>
                  </View>
                </View>

                <Text className="mt-4 text-[24px] font-semibold tracking-[-0.5px] text-[#111827]">
                  Sign in
                </Text>
                <Text className="mt-2 text-center text-[13px] leading-5 text-neutral-500">
                  Enter your employee ID and password to access your training
                  dashboard.
                </Text>
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-[12px] font-medium text-neutral-600">
                  Employee ID
                </Text>
                <TextInput
                  value={form.employee_id}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, employee_id: text }))
                  }
                  placeholder="Enter your ID"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="rounded-[14px] bg-[#FAFBFC] px-4 py-4 text-[15px] font-semibold text-neutral-900"
                  style={{
                    borderWidth: 1,
                    borderColor: "#DDE3EA",
                  }}
                />
                {!!errors.employee_id && (
                  <Text className="mt-2 text-[12px] text-red-500">
                    {errors.employee_id}
                  </Text>
                )}
              </View>

              <View>
                <Text className="mb-2 text-[12px] font-medium text-neutral-600">
                  Password
                </Text>
                <TextInput
                  value={form.password}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, password: text }))
                  }
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="rounded-[14px] bg-[#FAFBFC] px-4 py-4 text-[15px] font-semibold text-neutral-900"
                  style={{
                    borderWidth: 1,
                    borderColor: "#DDE3EA",
                  }}
                />
                {!!errors.password && (
                  <Text className="mt-2 text-[12px] text-red-500">
                    {errors.password}
                  </Text>
                )}
              </View>

              {!!errors.invalidCredential && (
                <Text className="mt-4 text-[12px] text-red-500">
                  {errors.invalidCredential}
                </Text>
              )}

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={submit}
                disabled={isSigningIn}
                className="mt-6 items-center justify-center rounded-[16px] bg-neutral-900"
                style={{
                  minHeight: 54,
                }}
              >
                {isSigningIn ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-[15px] font-semibold text-white">
                    Sign in
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
