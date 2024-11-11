import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import LeftIcon from "@/constants/icons/LeftIcon";

const LeftButton = () => {
  return (
    <View className="py-6">
      <TouchableOpacity
        className="w-12"
        activeOpacity={0.8}
        onPress={() => router.back()}
      >
        <LeftIcon width={30} height={30} />
      </TouchableOpacity>
    </View>
  );
};

export default LeftButton;
