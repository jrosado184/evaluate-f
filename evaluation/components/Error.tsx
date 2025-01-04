import { View, Text } from "react-native";
import React from "react";

interface ErrorTypes {
  styles?: string;
  title: string | null;
  hidden: boolean;
}

const Error: React.FC<ErrorTypes> = ({ styles, title, hidden }) => {
  return (
    <View className={`${hidden && "hidden"} w-[90%] ${styles}`}>
      <Text className="pl-1 text-red-500 my-2">{title}</Text>
    </View>
  );
};

export default Error;
