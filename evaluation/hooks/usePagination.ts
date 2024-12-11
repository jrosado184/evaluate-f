import useEmployeeContext from "@/app/context/GlobalContext";
import { useState } from "react";

const usePagination = (getData: any, setData: any) => {
  let page = 1;
  let limit = 4;
  const [fetchingMoreUsers, setFetchingMoreUsers] = useState<Boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [nextPage, setNextPage] = useState(page + 1);

  const { userDetails, setUserDetails } = useEmployeeContext();

  const getMoreData = async () => {
    if (
      fetchingMoreUsers ||
      isSearching ||
      userDetails.currentPage >= userDetails.totalPages
    )
      return;
    setFetchingMoreUsers(true);

    const data = await getData(nextPage, limit);
    if (data) {
      setData((prev: any) => [...prev, ...data.results]);
      setNextPage((prev: number) => prev + 1);
      setUserDetails({
        totalPages: userDetails.totalPages,
        totalUsers: userDetails.totalUsers,
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
