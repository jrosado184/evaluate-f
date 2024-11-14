import React from "react";
import { Stack } from "expo-router";
import useResetOnTabFocus from "@/hooks/useResetOnTabFocus";

const HomeLayout = () => {
  useResetOnTabFocus("home", "home");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="enter_manually"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default HomeLayout;
