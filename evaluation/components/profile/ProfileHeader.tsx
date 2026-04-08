import React from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { router } from "expo-router";
import SinglePressTouchable from "@/app/utils/SinglePress";

const ProfileHeader = () => {
  return (
    <View className="mb-6">
      <SinglePressTouchable
        onPress={() => router.back()}
        className="self-start rounded-full bg-white px-3 py-2"
        style={{
          borderWidth: 1,
          borderColor: "#E3E8EF",
        }}
      >
        <View className="flex-row items-center">
          <Icon name="chevron-left" size={18} color="#171717" />
          <Text className="ml-1 text-[14px] font-semibold text-neutral-900">
            Back
          </Text>
        </View>
      </SinglePressTouchable>

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
