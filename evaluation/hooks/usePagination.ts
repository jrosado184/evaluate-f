import useEmployeeContext from "@/app/context/EmployeeContext";
import { useState } from "react";

const usePagination = (
  getData?: any,
  setData?: any,
  setDetails?: any,
  details?: any
) => {
  let page = 1;
  let limit = 4;
  const [fetchingMoreUsers, setFetchingMoreUsers] = useState<Boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [nextPage, setNextPage] = useState(2);

  const { employees } = useEmployeeContext();

  const getMoreData = async () => {
    if (
      employees.length < 4 ||
      fetchingMoreUsers ||
      isSearching ||
      details.currentPage >= details.totalPages
    )
      return;
    setFetchingMoreUsers(true);

    const data = await getData(nextPage, limit);
    if (data) {
      setData((prev: any) => [...prev, ...data.results]);
      setNextPage((prev: number) => prev + 1);
      setDetails({
        totalPages: details.totalPages,
        totalUsers: details.totalUsers,
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
