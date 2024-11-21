import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Href, router } from "expo-router";

interface CardTypes {
  title: string;
  icon: any;
  route: Href;
}
const Card: React.FC<CardTypes> = ({ title, icon, route }) => {
  return (
    <TouchableOpacity
      onPress={() => router.replace(route)}
      activeOpacity={0.8}
      className="w-[48%] h-[9rem] rounded-lg border border-gray-400 items-center justify-center gap-2"
    >
      <View>{icon}</View>
      <Text className="font-inter-semibold">{title}</Text>
    </TouchableOpacity>
  );
};

export default Card;
