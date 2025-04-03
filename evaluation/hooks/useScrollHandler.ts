import { useRef } from "react";
import { useTabBar } from "@/app/(tabs)/_layout";
import usePagination from "./usePagination";
import useEmployeeContext from "@/app/context/EmployeeContext";

const useScrollHandler = () => {
  const { setIsTabBarVisible } = useTabBar();
  const { fetchingMoreUsers } = usePagination();
  const { employees } = useEmployeeContext();
  const prevScrollPos = useRef(0);

  const onScrollHandler = (event: any) => {
    const value = event.nativeEvent.contentOffset.y;

    const hardScrollIndicator = 25;

    // When fetching more users, ignore scroll events to avoid jump-induced state changes.
    if (fetchingMoreUsers) {
      prevScrollPos.current = value;
      return;
    }

    // If scrolling down (value increases) and past a threshold (80), hide the tab bar.
    if (value > prevScrollPos.current && value > 165 && employees.length > 4) {
      setIsTabBarVisible(false);
    }
    // If scrolling up (value decreases), show the tab bar immediately.
    //hard scroll indicator prevents tab bar from showing due to fetching more users
    else if (
      value < prevScrollPos.current &&
      prevScrollPos.current - value > hardScrollIndicator
    ) {
      setIsTabBarVisible(true);
    }

    prevScrollPos.current = value;
  };

  return { onScrollHandler };
};

export default useScrollHandler;
