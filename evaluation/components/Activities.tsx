import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import Activity from "./Activity";
import Button from "./Button";

const Activities = () => {
  return (
    <View className="w-full h-full">
      <Text className="font-inter-semibold text-[1.2 rem]">
        Recent activity
      </Text>
      <Activity />
      <Activity />
      <Activity />
      <TouchableOpacity
        activeOpacity={0.8}
        className="w-28 h-10 border border-black justify-center items-center rounded-md my-2"
      >
        <Text>View all</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Activities;
