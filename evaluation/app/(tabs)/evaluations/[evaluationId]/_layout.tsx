import React from "react";
import { Stack } from "expo-router";

const EvaluationIdLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ freezeOnBlur: true }} />
      <Stack.Screen name="step1" options={{ freezeOnBlur: true }} />
      <Stack.Screen name="step2" options={{ freezeOnBlur: true }} />
    </Stack>
  );
};

export default EvaluationIdLayout;
