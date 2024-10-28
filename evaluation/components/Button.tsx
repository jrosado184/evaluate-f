import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

interface ButtonTypes {
  title: string;
  handlePress: any;
  isLoading: boolean;
}

const Button: React.FC<ButtonTypes> = ({ title, handlePress, isLoading }) => {
  return (
    <View className=" justify-center items-center w-full my-12">
      <TouchableOpacity
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.8}
        className="bg-[#323FC1] w-[90%] h-16 rounded-[0.625rem] items-center justify-center"
      >
        <Text className="font-inter-medium text-white">{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Button;
