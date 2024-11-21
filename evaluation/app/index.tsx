import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { Image, View } from "react-native";
import SpinningCircle from "@/constants/animations/spinning-circle";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(async () => {
        const token = AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/sign-in");
        } else {
          router.replace("/sign-in");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }, [])
  );
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView className="h-full justify-center items-center bg-neutral-50">
          <View className="h-full justify-center items-center">
            <Image
              className="w-80 h-48"
              resizeMode="contain"
              source={require("../constants/icons/logo.png")}
            />
            <SpinningCircle color="#0000ff" />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
