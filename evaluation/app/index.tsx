import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Image, View } from "react-native";
import SpinningCircle from "@/constants/animations/spinning-circle";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "@/constants/utilities/isTokenExpired";
import axios from "axios";

export default function Index() {
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(async () => {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          router.replace("/sign-in");
          return;
        }

        const decodedToken = jwtDecode(token);

        if (isTokenExpired(decodedToken)) {
          router.replace("/sign-in");
        } else {
          router.replace("/(tabs)/home");
        }
      }, 1500);
      return () => clearTimeout(timer);
    }, [])
  );

  return (
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
  );
}
