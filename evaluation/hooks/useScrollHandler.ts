import { useRef } from "react";
import { useTabBar } from "@/app/(tabs)/_layout";
import usePagination from "./usePagination";

const useScrollHandler = () => {
  const { fetchingMoreUsers, getMoreData } = usePagination();
  const { toggleTabBar } = useTabBar();

  const scrollOffsetY = useRef(0);

  const SCROLL_THRESHOLD = 10; // Minimum scroll movement to toggle the bar

  const onScrollHandler = (event: any) => {
    const currentOffsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // Check if user is near the bottom of the list
    const isNearBottom = currentOffsetY + layoutHeight >= contentHeight - 50;

    // Fetch more data if near the bottom
    if (isNearBottom && !fetchingMoreUsers) {
      getMoreData();
    }

    // Handle tab bar visibility
    if (currentOffsetY <= SCROLL_THRESHOLD) {
      // Show tab bar if at the very top
      toggleTabBar(true);
    } else if (
      !fetchingMoreUsers &&
      Math.abs(currentOffsetY - scrollOffsetY.current) > SCROLL_THRESHOLD
    ) {
      // Toggle tab bar based on scroll direction
      if (currentOffsetY > scrollOffsetY.current) {
        toggleTabBar(false); // Hide tab bar on scroll down
      } else {
        toggleTabBar(true); // Show tab bar on scroll up
      }
    }

    scrollOffsetY.current = currentOffsetY;
  };

  return { onScrollHandler };
};

export default useScrollHandler;
