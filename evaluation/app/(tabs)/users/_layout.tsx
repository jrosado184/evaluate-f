import { Stack } from "expo-router";
import React from "react";
import { useTabBar } from "@/app/(tabs)/_layout";
import useResetOnTabFocus from "@/hooks/useResetOnTabFocus";

export default function UsersLayout() {
  useResetOnTabFocus("users");

  const { setIsTabBarVisible } = useTabBar();

  return (
    <Stack
      screenOptions={({ route }) => ({
        animation: "ios_from_left",
        headerShown: false,
      })}
      screenListeners={{
        focus: () => {
          setIsTabBarVisible(true);
        },
      }}
    />
  );
}
