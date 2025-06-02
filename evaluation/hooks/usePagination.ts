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
      totalPages: 100,
    }));
  };

  const getMoreData = async () => {
    const currentPage = details?.currentPage || 1;
    const totalPages = details?.totalPages || 1;

    if (
      fetchingMoreUsers ||
      isSearchingRef.current ||
      currentPage >= totalPages
    ) {
      return;
    }

    setFetchingMoreUsers(true);

    try {
      const data = await getData(nextPage, limit);

      // If no results, set totalPages = currentPage to stop further calls
      if (!data || !data.results || data.results.length === 0) {
        setDetails((prev: any) => ({
          ...prev,
          currentPage: totalPages,
          totalPages: currentPage, // Stop pagination
        }));
        return;
      }

      setData((prev: any[] = []) => {
        const combined = [...prev, ...data.results];
        const unique = combined.reduce((acc: any[], user: any) => {
          if (!acc.some((u) => u._id === user._id)) {
            acc.push(user);
          }
          return acc;
        }, []);
        return unique;
      });

      const newPage = nextPage;
      setNextPage(newPage + 1);
      setDetails((prev: any) => ({
        ...prev,
        currentPage: newPage,
        totalPages: data.totalPages || prev.totalPages || 1,
      }));
    } catch (err) {
      console.error("Pagination error:", err);
    } finally {
      setFetchingMoreUsers(false);
    }
  };

  return {
    getMoreData,
    setIsSearching,
    resetPagination,
    fetchingMoreUsers,
  };
};

export default usePagination;
