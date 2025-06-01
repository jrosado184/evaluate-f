import { View, Text } from "react-native";
import React from "react";
import { Href, router } from "expo-router";
import SinglePressTouchable from "@/app/utils/SinglePress";

interface CardTypes {
  title: string;
  icon: any;
  route: Href;
}
const Card: React.FC<CardTypes> = ({ title, icon, route }) => {
  return (
    <SinglePressTouchable
      onPress={() => router.push(route)}
      activeOpacity={0.8}
      className="w-[48%] h-[9rem] rounded-lg border border-gray-400 items-center justify-center gap-2"
    >
      <View>{icon}</View>
      <Text className="font-inter-semibold">{title}</Text>
    </SinglePressTouchable>
  );
};

export default Card;
