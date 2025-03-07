import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useTabBar } from "@/app/(tabs)/_layout";
import usePagination from "./usePagination";

const useScrollHandler = () => {
  const { fetchingMoreUsers, getMoreData } = usePagination();
  const { scrollY, setIsTabBarVisible } = useTabBar(); // Get tab bar state and setter

  const onScrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false } // Set to false if debugging; change to true for production
  );

  useEffect(() => {
    let timeout: any;

    const listener = scrollY.addListener(({ value }) => {
      if (timeout) clearTimeout(timeout); // Reset timeout on new scroll event

      if (value > 80) {
        setIsTabBarVisible(false); // Hide tab bar when scrolling down past 80px
      } else {
        setIsTabBarVisible(true); // Show tab bar when near top
      }

      timeout = setTimeout(() => {
        if (value < 80) {
          // If user stops near the top, restore tab bar
          Animated.timing(scrollY, {
            toValue: 0,
            duration: 500, // Faster reset
            useNativeDriver: false, // Set to true for production
          }).start();
        }
      }, 100); // Short delay before resetting
    });

    return () => {
      scrollY.removeListener(listener);
      if (timeout) clearTimeout(timeout);
    };
  }, [scrollY, setIsTabBarVisible]);

  return { onScrollHandler };
};

export default useScrollHandler;
