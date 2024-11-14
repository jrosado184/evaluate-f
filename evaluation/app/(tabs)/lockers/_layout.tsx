import React from "react";
import { Stack } from "expo-router";
import useResetOnTabFocus from "@/hooks/useResetOnTabFocus";

const UserLayout = () => {
  useResetOnTabFocus("lockers", "lockers");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
};

export default UserLayout;
