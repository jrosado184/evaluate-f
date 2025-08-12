import { Stack } from "expo-router";
import React from "react";
import { useTabBar } from "@/app/(tabs)/_layout";

export default function UsersLayout() {
  const { setIsTabBarVisible } = useTabBar();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // default animations for push/pop
        animation: "default",
        // when you use router.replace, animate like a "back"/pop:
        animationTypeForReplace: "pop",
      }}
      screenListeners={{
        focus: () => setIsTabBarVisible(true),
      }}
    />
  );
}
