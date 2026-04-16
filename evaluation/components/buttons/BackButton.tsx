import { View, Text } from "react-native";
import React from "react";
import SinglePressTouchable from "@/app/utils/SinglePress";
import Icon from "react-native-vector-icons/Feather";
import { router } from "expo-router";

const BackButton = () => {
  return (
    <View>
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
    </View>
  );
};

export default BackButton;
