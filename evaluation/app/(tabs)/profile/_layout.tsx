import React from "react";
import { Stack } from "expo-router";
import useResetOnTabFocus from "@/hooks/useResetOnTabFocus";

const UserLayout = () => {
  useResetOnTabFocus("profile", "profile");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    ></Stack>
  );
};

export default UserLayout;
