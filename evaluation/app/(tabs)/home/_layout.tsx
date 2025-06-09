import React from "react";
import { Stack } from "expo-router";
import useResetOnTabFocus from "@/hooks/useResetOnTabFocus";

const HomeLayout = () => {
  useResetOnTabFocus("home");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right", // animation style
        gestureEnabled: true, // allows swipe-back gesture (optional)
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default HomeLayout;
