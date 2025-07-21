import { Stack } from "expo-router";
import React from "react";
import { useTabBar } from "@/app/(tabs)/_layout";
import useResetOnTabFocus from "@/hooks/useResetOnTabFocus";

export default function UsersLayout() {
  useResetOnTabFocus("users");

  const { setIsTabBarVisible } = useTabBar();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
      screenListeners={{
        focus: () => {
          setIsTabBarVisible(true);
        },
      }}
    />
  );
}
