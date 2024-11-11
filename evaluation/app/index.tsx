import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, View } from "react-native";
import SpinningCircle from "@/constants/animations/spinning-circle";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { PaperProvider } from "react-native-paper";

export default function Index() {
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 3000);

      return () => clearTimeout(timer);
    }, [])
  );
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView className="h-full justify-center items-center ">
          <View className="h-full justify-center items-center">
            <Image
              className="w-80 h-48"
              resizeMode="contain"
              source={require("../constants/icons/logo.png")}
            />
            <SpinningCircle />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
