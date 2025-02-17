import { View, Text } from "react-native";
import React from "react";
import SpinningCircle from "@/constants/animations/spinning-circle";

const LoadingCircle = () => {
  return (
    <View className="justify-center items-center h-full">
      <SpinningCircle color="#0000ff" />
    </View>
  );
};

export default LoadingCircle;
