import { View, Text, Image } from "react-native";
import React from "react";

interface CardTypes {
  title: string;
  icon: any;
}
const Card: React.FC<CardTypes> = ({ title, icon }) => {
  return (
    <View className="w-[48%] h-[9rem] rounded-lg border border-[#616161] items-center justify-center gap-2">
      <View>{icon}</View>
      <Text className="font-inter-semibold">{title}</Text>
    </View>
  );
};

export default Card;
