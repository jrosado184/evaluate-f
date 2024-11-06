import { View, Text } from "react-native";
import React from "react";

const Greeting = () => {
  return (
    <View className="my-2 gap-2">
      <Text className="font-inter-semibold text-[1.2rem]">
        Welcome, Javier Rosado
      </Text>
      <Text className="font-inter-regular text-gray-500">
        February 18, 2024
      </Text>
    </View>
  );
};

export default Greeting;
