import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="h-full flex justify-center items-center">
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link className="text-blue-500" href="/users">
        Go To Here
      </Link>
    </View>
  );
}
