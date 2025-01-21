import { useState } from "react";

const usePagination = (
  lockerOrUser?: any,
  getData?: any,
  setData?: any,
  setDetails?: any,
  details?: any,
  limit: any = 4
) => {
  let page = 1;
  const [fetchingMoreUsers, setFetchingMoreUsers] = useState<Boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [nextPage, setNextPage] = useState(2);

  const getMoreData = async () => {
    if (
      lockerOrUser.length < 4 ||
      fetchingMoreUsers ||
      isSearching ||
      details.currentPage >= details.totalPages
    )
      return;

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

      setDetails({
        ...details,
        currentPage: nextPage,
      });
    }
    setFetchingMoreUsers(false);
  };

  return {
    limit,
    page,
    getMoreData,
    setIsSearching,
    isSearching,
    nextPage,
    setNextPage,
    fetchingMoreUsers,
  };
};

export default usePagination;
