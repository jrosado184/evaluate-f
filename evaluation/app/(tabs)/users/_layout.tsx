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
