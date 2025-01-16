import { View, ScrollView, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import { router } from "expo-router";
import axios from "axios";
import Error from "@/components/Error";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "../requests/NetworkAddress";
import useAuthContext from "../context/AuthContext";

const SignIn = () => {
  const [form, setForm] = useState<{
    employee_id: any;
    password: string;
  }>({
    employee_id: 0,
    password: "",
  });

  const [errors, setErrors] = useState({
    emplyee_id: null,
    password: "",
    invalidCreddential: "",
  });

  const [isSigningIn, setIsSigningIn] = useState(false);

  const { currentUser, setCurrentUser } = useAuthContext();

  const submit = async () => {
    setIsSigningIn(true);
    const baseUrl = await getServerIP();
    axios
      .post(`${baseUrl}/auth/login`, {
        employee_id: form.employee_id,
        password: form.password,
      })
      .then(async (res) => {
        const userName = res.data;
        setCurrentUser(userName);
        AsyncStorage.setItem("currentUser", userName.name);
        AsyncStorage.setItem("token", res.data.token);
        if (res.status === 200) router.replace("/home");
        setIsSigningIn(false);
      })
      .catch((error) => {
        setIsSigningIn(false);
        setErrors({
          ...errors,
          emplyee_id: error.response.data.employee_id,
          password: error.response.data.password,
          invalidCreddential: error.response.data.message,
        });
        throw Error(error);
      });
  };
  return (
    <SafeAreaView className="h-full bg-neutral-50">
      <ScrollView>
        <View className="w-full min-h-[85vh] justify-center">
          <Image
            resizeMode="contain"
            className="w-[14rem] h-20 ml-8"
            source={require("../../constants/icons/logo.png")}
          />
          <View className="justify-center items-center w-full">
            <FormField
              inputStyles="pl-4"
              title="Employee ID"
              value={form.employee_id}
              handleChangeText={(e: any) =>
                setForm({ ...form, employee_id: e.toLowerCase() })
              }
              styles="mt-7 w-[90%]"
              placeholder="Enter your ID"
              rounded="rounded-[0.625rem]"
            />
            <Error hidden={!errors.emplyee_id} title={errors.emplyee_id} />
            <FormField
              inputStyles="pl-4"
              title="Password"
              value={form.password}
              handleChangeText={(e: any) => setForm({ ...form, password: e })}
              styles="mt-7 w-[90%]"
              placeholder="Enter your password"
              rounded="rounded-[0.625rem]"
            />
            <Error hidden={!errors.password} title={errors.password} />
            <Error
              hidden={!errors.invalidCreddential}
              title={
                errors.invalidCreddential &&
                "Employee id and password are incorrect"
              }
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
