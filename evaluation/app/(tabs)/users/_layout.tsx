import { Stack } from "expo-router";
import React from "react";
import useResetOnTabFocus from "@/hooks/useResetOnTabFocus";

export default function UsersLayout() {
  useResetOnTabFocus("users");

  return (
    <Stack
      screenOptions={{
        headerShown: false, // no header
      }}
    />
  );
}
