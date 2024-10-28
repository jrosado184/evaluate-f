import { View, Text, ScrollView, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import { router } from "expo-router";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isSigningIn, setIsSigningIn] = useState(false);

  const submit = () => {
    router.replace("/home");
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
              title="Email"
              value={form.email}
              handleChangeText={(e: any) => setForm({ ...form, email: e })}
              keyboadtype="email-address"
              styles="mt-7"
              placeholder="Enter your email"
            />
            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e: any) => setForm({ ...form, password: e })}
              styles="mt-7"
              placeholder="Enter your password"
            />
            <Button
              handlePress={submit}
              isLoading={isSigningIn}
              title="Sign in"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
