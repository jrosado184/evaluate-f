import { useCallback, useRef } from "react";
import { router, useFocusEffect, useSegments } from "expo-router";

const useResetOnTabReturn = (tabName: any) => {
  const segments = useSegments();
  const previousTab = useRef<any | null>(null);
  const wasNested = useRef(false);
  const didReset = useRef(false); // 👈 new flag!

  useFocusEffect(
    useCallback(() => {
      const currentTab = segments[1];
      const isNested = segments.length > 2;

      if (isNested) {
        wasNested.current = true;
        didReset.current = false;
      } else if (wasNested.current && !didReset.current) {
        if (currentTab === tabName.replace("/(tabs)/", "")) {
          router.replace(tabName);
          didReset.current = true; // ✅ only do this once
        }
      }

      previousTab.current = currentTab;
    }, [segments, tabName])
  );
};

export default useResetOnTabReturn;
