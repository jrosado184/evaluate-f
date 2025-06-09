import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { useTabBar } from "@/app/(tabs)/_layout";
import useResetOnTabFocus from "@/hooks/useResetOnTabFocus";

export default function UsersLayout() {
  useResetOnTabFocus("users");

  const { setIsTabBarVisible } = useTabBar();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right", // animation style
        gestureEnabled: true, // allows swipe-back gesture (optional)
      }}
      screenListeners={{
        focus: () => {
          // 👇 Whenever any Users screen becomes focused, re-show the tab bar
          setIsTabBarVisible(true);
        },
      }}
    />
  );
}
