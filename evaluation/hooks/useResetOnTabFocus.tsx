import { useFocusEffect, useSegments, router } from "expo-router";
import { useCallback, useRef } from "react";

const useResetOnTabFocus = (tab: string) => {
  const segments = useSegments();
  const wasInOtherTab = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const currentTab = segments[1];
      const isNested = segments.length > 2;

      if (currentTab !== tab) {
        wasInOtherTab.current = true;
        return;
      }

      if (wasInOtherTab.current && isNested) {
        router.dismissAll();
        router.replace(`/(tabs)/${tab}`);
      }

      // Reset flag
      wasInOtherTab.current = false;
    }, [segments, tab])
  );
};

export default useResetOnTabFocus;
