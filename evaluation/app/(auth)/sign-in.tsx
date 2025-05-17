import { View, ScrollView, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import { router } from "expo-router";
import axios from "axios";
import Error from "@/components/ErrorText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "../requests/NetworkAddress";
import useAuthContext from "../context/AuthContext";

const SignIn = () => {
  const [form, setForm] = useState({
    employee_id: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    employee_id: null,
    password: null,
    invalidCreddential: "",
  });

  const [isSigningIn, setIsSigningIn] = useState(false);
  const { currentUser, setCurrentUser } = useAuthContext();

  const submit = async () => {
    setIsSigningIn(true);
    try {
      const baseUrl = await getServerIP();
      const res = await axios.post(`${baseUrl}/auth/login`, {
        employee_id: form.employee_id,
        password: form.password,
      });

      const userName = res.data;
      setCurrentUser(userName);
      await AsyncStorage.setItem("currentUser", userName.name);
      await AsyncStorage.setItem("token", res.data.token);

      if (res.status === 200) router.replace("/home");
    } catch (error: any) {
      console.log(error);
      const { employee_id, password, message } = error.response?.data || {};
      setErrors({
        employee_id,
        password,
        invalidCreddential: message || "Login failed",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView className="h-full bg-neutral-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="w-full min-h-[85vh] justify-center">
          <Image
            resizeMode="contain"
            className="w-[14rem] h-20 ml-8"
            source={require("../../constants/icons/logo.png")}
          />
          <View className="justify-center items-center w-full">
            {/* Employee ID */}
            <FormField
              title="Employee ID"
              value={form.employee_id}
              handleChangeText={(e: string) =>
                setForm({ ...form, employee_id: e })
              }
              styles="mt-7 w-[90%]"
              placeholder="Enter your ID"
              rounded="rounded-[0.625rem]"
            />
            <Error
              hidden={!errors.employee_id}
              title={errors.employee_id}
              styles="w-[90%]"
            />

            {/* Password */}
            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e: string) =>
                setForm({ ...form, password: e })
              }
              styles="mt-7 w-[90%]"
              placeholder="Enter your password"
              rounded="rounded-[0.625rem]"
            />
            <Error
              hidden={!errors.password}
              title={errors.password}
              styles="w-[90%]"
            />

            {/* Invalid Credentials */}
            <Error
              hidden={!errors.invalidCreddential}
              title="Employee ID and password are incorrect"
              styles="w-[90%]"
            />

            <Button
              handlePress={submit}
              isLoading={isSigningIn}
              title="Sign in"
              styles="my-12 w-full rounded-[0.625rem]"
              inputStyles="w-[90%]"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
