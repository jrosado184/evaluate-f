import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import FormField from "@/components/FormField";
import LeftIcon from "@/constants/icons/LeftIcon";
import { router } from "expo-router";

const enter_manually = () => {
  return (
    <SafeAreaView className="p-6">
      <Header />
      <View className="py-6">
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
          <LeftIcon width={30} height={30} />
        </TouchableOpacity>
      </View>
      <View className="my-2">
        <Text className="font-inter-semibold text-[1.2rem]">
          Personal Details
        </Text>
        <FormField styles="w-100" placeholder="First Name" />
        <FormField styles="w-100" placeholder="Last Name" />
        <FormField styles="w-100" placeholder="Job Title" />
        <FormField styles="w-100" placeholder="Identification Number" />
      </View>
      <View className="my-6">
        <Text className="font-inter-semibold text-[1.2rem]">
          Locker Details
        </Text>
        <FormField styles="w-100" placeholder="Locker Number" />
        <FormField styles="w-100" placeholder="Assign QR Code" />
      </View>
      <View className="w-full items-center justify-end h-[5.2rem] ">
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-28 h-10 border border-black justify-center items-center rounded-md my-2"
        >
          <Text>Add User</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default enter_manually;
