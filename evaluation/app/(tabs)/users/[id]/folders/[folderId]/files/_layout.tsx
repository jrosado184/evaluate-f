// users/[id]/folders/[folderId]/files/_layout.tsx

import { Stack } from "expo-router";
import React from "react";

export default function FilesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
