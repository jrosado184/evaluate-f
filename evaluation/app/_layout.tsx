import React, { useEffect, useState } from "react";
import { Link, SplashScreen, Stack } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import AppLoading from "expo-app-loading";
import "../global.css";
import * as Font from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Inter-Thin": require("../assets/fonts/Inter_18pt-Thin.ttf"),
        "Inter-Regular": require("../assets/fonts/Inter_18pt-Regular.ttf"),
        "Inter-Medium": require("../assets/fonts/Inter_18pt-Medium.ttf"),
        "Inter-SemiBold": require("../assets/fonts/Inter_18pt-SemiBold.ttf"),
      });
      setFontsLoaded(true);
      SplashScreen.hideAsync(); // Hide the splash screen after fonts are loaded
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Render nothing until fonts are loaded
  }
  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  );
}
