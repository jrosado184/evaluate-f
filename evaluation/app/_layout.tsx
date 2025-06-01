import { Slot, Stack } from "expo-router"; // ✅ Add Stack here
import React, { useEffect, useState } from "react";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { EmployeeProvider } from "./context/EmployeeContext";
import { AuthProvider } from "./context/AuthContext";
import { JobsProvider } from "./context/JobsContext";
import { ActionsProvider } from "./context/ActionsContext";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import "@/global.css";
import useAxios401Interceptor from "@/hooks/useAxios401Interceptor";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useAxios401Interceptor();

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
      await SplashScreen.hideAsync();
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
          <PaperProvider>
            <EmployeeProvider>
              <JobsProvider>
                <ActionsProvider>
                  <Stack
                    screenOptions={{
                      animation: "slide_from_right", // animation style
                      gestureEnabled: true, // allows swipe-back gesture (optional)
                      headerShown: false,
                    }}
                  >
                    <Slot /> {/* The Slot will render your screens */}
                  </Stack>
                </ActionsProvider>
              </JobsProvider>
            </EmployeeProvider>
          </PaperProvider>
        </AuthProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
