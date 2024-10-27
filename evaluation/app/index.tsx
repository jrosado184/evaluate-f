import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="h-full flex justify-center items-center">
      <Text className="font-inter-medium text-2xl">
        Edit app/index.tsx to edit this screen.
      </Text>
      <Link href="/home">Go Home</Link>
    </View>
  );
}
