import { useRef } from "react";
import { useTabBar } from "@/app/(tabs)/_layout";
import usePagination from "./usePagination";
import debounce from "lodash.debounce";

const useScrollHandler = () => {
  const { fetchingMoreUsers, getMoreData } = usePagination();
  const { toggleTabBar } = useTabBar();

  const scrollOffsetY = useRef(0);
  const isTabBarVisible = useRef(true);

  const SCROLL_THRESHOLD = 30; // Minimum scroll movement to toggle the bar
  const BOTTOM_THRESHOLD = 50; // Distance from the bottom to trigger fetching

  // Debounced function for toggling the tab bar
  const debouncedToggleTabBar = debounce((show) => {
    if (isTabBarVisible.current !== show) {
      toggleTabBar(show);
      isTabBarVisible.current = show;
    }
  }, 100);

  const onScrollHandler = (event: any) => {
    const currentOffsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // Check if user is near the bottom of the list
    const isNearBottom =
      currentOffsetY + layoutHeight >= contentHeight - BOTTOM_THRESHOLD;

    if (isNearBottom) {
      // Fetch more data and prevent tab bar toggling when near bottom
      if (!fetchingMoreUsers) {
        getMoreData();
      }
      return; // Prevent tab bar toggling while near the bottom
    }

    // Handle tab bar visibility
    if (currentOffsetY <= SCROLL_THRESHOLD) {
      // Show tab bar if at the very top
      debouncedToggleTabBar(true);
    } else if (
      Math.abs(currentOffsetY - scrollOffsetY.current) > SCROLL_THRESHOLD
    ) {
      // Toggle tab bar based on scroll direction
      if (currentOffsetY > scrollOffsetY.current) {
        debouncedToggleTabBar(false); // Hide tab bar on scroll down
      } else {
        debouncedToggleTabBar(true); // Show tab bar on scroll up
      }
    }

    scrollOffsetY.current = currentOffsetY;
  };

  return { onScrollHandler };
};

export default useScrollHandler;
