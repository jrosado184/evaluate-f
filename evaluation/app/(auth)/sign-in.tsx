import { View, Text, ScrollView, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import { router } from "expo-router";
import axios from "axios";
import Error from "@/components/Error";

const SignIn = () => {
  const [form, setForm] = useState({
    employee_id: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    emplyee_id: "",
    password: "",
    invalidCreddential: "",
  });

  const [isSigningIn, setIsSigningIn] = useState(false);

  const submit = () => {
    axios
      .post("http://localhost:9000/api/auth/login", {
        ...form,
      })
      .then((res) => {
        if (res.status === 200) router.replace("/home");
      })
      .catch((error) => {
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
    <SafeAreaView className="h-full">
      <ScrollView>
        <View className="w-full min-h-[85vh] justify-center">
          <Image
            resizeMode="contain"
            className="w-[14rem] h-20 ml-8"
            source={require("../../constants/icons/logo.png")}
          />
          <View className="justify-center items-center w-full">
            <FormField
              title="Employee ID"
              value={form.employee_id}
              handleChangeText={(e: any) =>
                setForm({ ...form, employee_id: e })
              }
              styles="mt-7"
              placeholder="Enter your ID"
            />
            <Error hidden={!errors.emplyee_id} title={errors.emplyee_id} />
            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e: any) => setForm({ ...form, password: e })}
              styles="mt-7"
              placeholder="Enter your password"
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
              styles="my-12 w-full"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
