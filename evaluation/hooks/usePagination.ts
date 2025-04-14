import { useRef, useState } from "react";

const usePagination = (
  lockerOrUser?: any,
  getData?: any,
  setData?: any,
  setDetails?: any,
  details?: any,
  limit: number = 4
) => {
  const [fetchingMoreUsers, setFetchingMoreUsers] = useState<boolean>(false);
  const isSearchingRef = useRef(false);
  const [nextPage, setNextPage] = useState(2);

  const setIsSearching = (value: boolean) => {
    isSearchingRef.current = value;
  };

  const resetPagination = () => {
    setNextPage(2);
    setDetails((prev: any) => ({
      ...prev,
      currentPage: 1,
      totalPages: 100, // fallback until updated
    }));
  };

  const getMoreData = async () => {
    const shouldRun =
      !fetchingMoreUsers &&
      !isSearchingRef.current &&
      details.currentPage < details.totalPages;

    if (!shouldRun) return;

    setFetchingMoreUsers(true);

    const data = await getData(nextPage, limit);
    if (data) {
      setData((prev: any) => {
        const combined = [...prev, ...data.results];
        const uniqueUsers = combined.reduce((acc: any[], user: any) => {
          if (!acc.some((item) => item._id === user._id)) {
            acc.push(user);
          }
          return acc;
        }, []);
        return uniqueUsers;
      });

      setNextPage((prev: number) => prev + 1);
      setDetails((prev: any) => ({
        ...prev,
        currentPage: nextPage,
      }));
    }

    setFetchingMoreUsers(false);
  };

  return {
    getMoreData,
    setIsSearching,
    resetPagination,
    fetchingMoreUsers,
  };
};

export default usePagination;
