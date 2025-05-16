// users/[id]/folders/[folderId]/files/[fileId]/_layout.tsx

import { Stack } from "expo-router";
import React from "react";

export default function FileIdLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
