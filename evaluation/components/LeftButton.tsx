import { View } from "react-native";
import React from "react";
import { router } from "expo-router";
import LeftIcon from "@/constants/icons/LeftIcon";
import SinglePressTouchable from "@/app/utils/SinglePress";

const LeftButton = ({ width, height }: any) => {
  return (
    <View className="py-6 h-14 w-8 justify-center items-center">
      <SinglePressTouchable
        className="w-12"
        activeOpacity={0.8}
        onPress={() => router.back()}
      >
        <LeftIcon width={width || 30} height={height || 30} />
      </SinglePressTouchable>
    </View>
  );
};

export default LeftButton;
