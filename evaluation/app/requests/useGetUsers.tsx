import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "./NetworkAddress";
import useEmployeeContext from "../context/EmployeeContext";
import { useCallback, useEffect, useState } from "react";
import usePagination from "@/hooks/usePagination";

const useGetUsers = () => {
  const { sortingBy, setUserDetails, setEmployees, setLoading } =
    useEmployeeContext();

  const limit = 4;

  const [sort, setSort] = useState("default");

  useEffect(() => {
    switch (sortingBy) {
      case "Lockers":
        setSort("locker_number");
        break;
      case "Unassigned":
        setSort("unassigned");
        break;
      case "Default":
        setSort("default");
      default:
        "Default";
    }
  }, [sortingBy]);

  const getUsers = useCallback(
    async (page = 1, limit = 4) => {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      try {
        const response = await axios.get(`${baseUrl}/employees`, {
          headers: { Authorization: token },
          params:
            sort === "unassigned"
              ? { filter: "unassigned", order: "asc", page, limit }
              : { sort, order: "asc", page, limit },
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching employees:", error);
        return null;
      }
    },
    [sort]
  );

  const fetchAndSetUsers = async (page: number) => {
    const data = await getUsers(page, limit);
    if (data) {
      setUserDetails({
        totalUsers: data.totalEmployees,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      });
      setEmployees(() => {
        setLoading(false);
        if (page === 1) {
          return data.results;
        }
      });
    }
  };

  return { getUsers, fetchAndSetUsers };
};

export default useGetUsers;
