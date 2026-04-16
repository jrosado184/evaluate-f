import React from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { router } from "expo-router";
import SinglePressTouchable from "@/app/utils/SinglePress";
import BackButton from "../buttons/BackButton";

const ProfileHeader = () => {
  return (
    <View className="mb-6">
      <BackButton />

      <View className="mt-5">
        <Text className="text-[11px] font-medium uppercase tracking-[1px] text-neutral-400">
          Account
        </Text>
        <Text className="mt-1 text-[22px] font-semibold tracking-[-0.4px] text-[#111827]">
          Profile
        </Text>
        <Text className="mt-1 text-[13px] leading-5 text-neutral-500">
          Manage your account information, password, and access settings.
        </Text>
      </View>
    </View>
  );
};

export default ProfileHeader;
