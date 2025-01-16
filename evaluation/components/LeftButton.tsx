import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import LeftIcon from "@/constants/icons/LeftIcon";

const LeftButton = ({ width, height }: any) => {
  return (
    <View className="py-6 h-14 w-8 justify-center items-center">
      <TouchableOpacity
        className="w-12"
        activeOpacity={0.8}
        onPress={() => router.back()}
      >
        <LeftIcon width={width || 30} height={height || 30} />
      </TouchableOpacity>
    </View>
  );
};

export default LeftButton;
