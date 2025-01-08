import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import SpinningCircle from "@/constants/animations/spinning-circle";

//make this reusable

interface ButtonTypes {
  title: string;
  handlePress?: any;
  isLoading?: boolean;
  styles?: string;
  inputStyles?: string;
}

const Button: React.FC<ButtonTypes> = ({
  title,
  handlePress,
  isLoading,
  styles,
  inputStyles,
}) => {
  return (
    <View className={`justify-center items-center w-full ${styles}`}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.8}
        className={`bg-[#323FC1] h-16 rounded-[0.625rem] items-center justify-center ${inputStyles}`}
      >
        <Text className="font-inter-medium text-white text-[1rem]">
          {isLoading ? <SpinningCircle color="white" /> : title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Button;
