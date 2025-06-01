import { useFocusEffect } from "expo-router";
import { useTabBar } from "@/app/(tabs)/_layout"; // adjust path as needed
import { useCallback } from "react";

export const useShowTabBarOnFocus = () => {
  const { setIsTabBarVisible } = useTabBar();

  useFocusEffect(
    useCallback(() => {
      setIsTabBarVisible(true);
    }, [])
  );
};
