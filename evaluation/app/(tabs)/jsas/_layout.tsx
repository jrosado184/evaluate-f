import React from "react";
import { Stack } from "expo-router";
import useResetOnTabFocus from "@/hooks/useResetOnTabFocus";
import { useTabBar } from "../_layout";

const UserLayout = () => {
  useResetOnTabFocus("lockers");
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
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
};

export default UserLayout;
