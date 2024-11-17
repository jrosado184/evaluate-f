import { useCallback, useRef } from "react";
import { router, useFocusEffect, useSegments } from "expo-router";

const useResetOnTabReturn = (tabName: any) => {
  const segments = useSegments(); // Get the current navigation segments
  const previousTab = useRef<any | null>(null); // Track the previous tab state
  const wasNested = useRef(false); // Track if the user was nested

  useFocusEffect(
    useCallback(() => {
      const currentTab = segments[1]; // Current tab (based on segments)
      const isNested = segments.length > 2; // Check if in a nested route

      // Only replace if coming back from a nested state and tabs have changed
      if (isNested) {
        wasNested.current = true;
      } else if (wasNested.current && previousTab.current !== currentTab) {
        wasNested.current = false; // Reset nested state
        router.replace(tabName); // Reset to the tab root
      }

      // Update the previous tab state
      previousTab.current = currentTab;
    }, [segments, tabName])
  );
};

export default useResetOnTabReturn;
