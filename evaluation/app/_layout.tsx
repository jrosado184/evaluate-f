import React, { useEffect, useState } from "react";
import { SplashScreen, Stack } from "expo-router";
import "../global.css";
import * as Font from "expo-font";
import { EmployeeProvider } from "./context/GlobalContext";
import "react-native-gesture-handler";
import "react-native-reanimated";

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
        "Inter-Bold": require("../assets/fonts/Inter_18pt-Bold.ttf"),
        "Inter-ExtraBold": require("../assets/fonts/Inter_18pt-ExtraBold.ttf"),
      });
      setFontsLoaded(true);
      SplashScreen.hideAsync();
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <EmployeeProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        {/* <Stack.Screen
        name="/search/[query]"
        options={{
          headerShown: false,
        }}
      /> */}
      </Stack>
    </EmployeeProvider>
  );
}
