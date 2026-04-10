import React, { useMemo, useState } from "react";
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
import { User, Lock, Eye, EyeOff } from "lucide-react-native";

const COLORS = {
  bg: "#F3F4F6",
  card: "#FFFFFF",
  cardBorder: "#E5E7EB",
  text: "#111827",
  muted: "#6B7280",
  subtle: "#9CA3AF",
  label: "#374151",
  inputBg: "#F9FAFB",
  inputBorder: "#D1D5DB",
  inputFocus: "#1A237E",
  brand: "#1A237E",
  brandPressed: "#151C66",
  icon: "#6B7280",
  iconSoft: "#F3F4F6",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
};

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
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "employee_id" | "password" | null
  >(null);

  const { setCurrentUser } = useAuthContext();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeTablet = width >= 1100;

  const contentWidth = useMemo(() => {
    if (isLargeTablet) return 520;
    if (isTablet) return 500;
    return width * 0.9;
  }, [isLargeTablet, isTablet, width]);

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
          !employee_id && !password ? message || "Unable to sign in." : "",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const getBorderColor = (
    field: "employee_id" | "password",
    hasError: boolean,
  ) => {
    if (hasError) return "#FCA5A5";
    if (focusedField === field) return COLORS.inputFocus;
    return COLORS.inputBorder;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingTop: isTablet ? 28 : 20,
          paddingBottom: 28,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View style={{ width: contentWidth }}>
            <View
              style={{
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Image
                resizeMode="contain"
                source={require("../../constants/icons/logo.png")}
                style={{
                  width: isTablet ? 185 : 160,
                  height: isTablet ? 52 : 46,
                }}
              />
            </View>

            <View
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
                paddingHorizontal: isTablet ? 24 : 18,
                paddingTop: isTablet ? 22 : 18,
                paddingBottom: isTablet ? 20 : 18,
              }}
            >
              <View style={{ marginBottom: 18 }}>
                <Text
                  style={{
                    fontSize: isTablet ? 24 : 22,
                    lineHeight: isTablet ? 30 : 28,
                    fontWeight: "700",
                    color: COLORS.text,
                  }}
                >
                  Sign in
                </Text>

                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    lineHeight: 21,
                    color: COLORS.muted,
                  }}
                >
                  Use your employee credentials to continue.
                </Text>
              </View>

              {!!errors.invalidCredential && (
                <View
                  style={{
                    marginBottom: 14,
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: COLORS.errorBg,
                    borderWidth: 1,
                    borderColor: COLORS.errorBorder,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      lineHeight: 18,
                      fontWeight: "600",
                      color: "#B42318",
                    }}
                  >
                    {errors.invalidCredential}
                  </Text>
                </View>
              )}

              <View style={{ gap: 14 }}>
                <View>
                  <Text
                    style={{
                      marginBottom: 6,
                      fontSize: 12,
                      fontWeight: "600",
                      color: COLORS.label,
                    }}
                  >
                    Employee ID
                  </Text>

                  <View
                    style={{
                      minHeight: isTablet ? 54 : 52,
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 16,
                      backgroundColor: COLORS.inputBg,
                      borderWidth: 1,
                      borderColor: getBorderColor(
                        "employee_id",
                        !!errors.employee_id,
                      ),
                      paddingHorizontal: 12,
                    }}
                  >
                    <User size={16} color={COLORS.icon} />

                    <TextInput
                      value={form.employee_id}
                      onChangeText={(text) =>
                        setForm((prev) => ({ ...prev, employee_id: text }))
                      }
                      onFocus={() => setFocusedField("employee_id")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your employee ID"
                      placeholderTextColor={COLORS.subtle}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        flex: 1,
                        marginLeft: 10,
                        fontSize: 15,
                        fontWeight: "500",
                        color: COLORS.text,
                      }}
                    />
                  </View>

                  {!!errors.employee_id && (
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        fontWeight: "500",
                        color: COLORS.error,
                      }}
                    >
                      {errors.employee_id}
                    </Text>
                  )}
                </View>

                <View>
                  <Text
                    style={{
                      marginBottom: 6,
                      fontSize: 12,
                      fontWeight: "600",
                      color: COLORS.label,
                    }}
                  >
                    Password
                  </Text>

                  <View
                    style={{
                      minHeight: isTablet ? 54 : 52,
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 16,
                      backgroundColor: COLORS.inputBg,
                      borderWidth: 1,
                      borderColor: getBorderColor(
                        "password",
                        !!errors.password,
                      ),
                      paddingHorizontal: 12,
                    }}
                  >
                    <Lock size={16} color={COLORS.icon} />

                    <TextInput
                      value={form.password}
                      onChangeText={(text) =>
                        setForm((prev) => ({ ...prev, password: text }))
                      }
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your password"
                      placeholderTextColor={COLORS.subtle}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        flex: 1,
                        marginLeft: 10,
                        fontSize: 15,
                        fontWeight: "500",
                        color: COLORS.text,
                      }}
                    />

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setShowPassword((prev) => !prev)}
                      style={{
                        width: 30,
                        height: 30,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={17} color={COLORS.icon} />
                      ) : (
                        <Eye size={17} color={COLORS.icon} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {!!errors.password && (
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        fontWeight: "500",
                        color: COLORS.error,
                      }}
                    >
                      {errors.password}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.92}
                onPress={submit}
                disabled={isSigningIn}
                style={{
                  marginTop: 18,
                  minHeight: isTablet ? 54 : 52,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: COLORS.brand,
                }}
              >
                {isSigningIn ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
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
