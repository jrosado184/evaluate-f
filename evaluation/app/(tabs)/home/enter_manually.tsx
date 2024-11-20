import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import FormField from "@/components/FormField";
import LeftIcon from "@/constants/icons/LeftIcon";
import { router } from "expo-router";
import LeftButton from "@/components/LeftButton";

const enter_manually = () => {
  return (
    <SafeAreaView className="p-6">
      <LeftButton />
      <View className="my-2">
        <Text className="font-inter-semibold text-[1.2rem]">
          Personal Details
        </Text>
        <FormField inputStyles="pl-4" styles="w-100" placeholder="First Name" />
        <FormField inputStyles="pl-4" styles="w-100" placeholder="Last Name" />
        <FormField inputStyles="pl-4" styles="w-100" placeholder="Job Title" />
        <FormField
          inputStyles="pl-4"
          styles="w-100"
          placeholder="Identification Number"
        />
      </View>
      <View className="my-6">
        <Text className="font-inter-semibold text-[1.2rem]">
          Locker Details
        </Text>
        <FormField
          inputStyles="pl-4"
          styles="w-100"
          placeholder="Locker Number"
        />
        <FormField
          inputStyles="pl-4"
          styles="w-100"
          placeholder="Assign QR Code"
        />
      </View>
      <View className="w-full items-center justify-center h-[5.2rem] ">
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-28 h-10 border border-gray-700 justify-center items-center rounded-md my-2"
        >
          <Text>Add User</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default enter_manually;
