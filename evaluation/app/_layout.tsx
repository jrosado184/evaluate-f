import React, { useEffect, useState } from "react";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { SplashScreen, Stack } from "expo-router";
import "../global.css";
import * as Font from "expo-font";
import { EmployeeProvider } from "./context/EmployeeContext";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { AuthProvider } from "./context/AuthContext";
import { JobsProvider } from "./context/JobsContext";
import { ActionsProvider } from "./context/ActionsContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="light">
        <AuthProvider>
          <EmployeeProvider>
            <JobsProvider>
              <ActionsProvider>
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
                </Stack>
              </ActionsProvider>
            </JobsProvider>
          </EmployeeProvider>
        </AuthProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
