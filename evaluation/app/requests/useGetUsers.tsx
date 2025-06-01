import { useCallback } from "react";
import useEmployeeContext from "../context/EmployeeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "./NetworkAddress";
import axios from "axios";

const useGetUsers = () => {
  const { setUserDetails, setEmployees, setLoading } = useEmployeeContext();
  const limit = 4;

  const getUsers = useCallback(async (page = 1, sort: string) => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();

    try {
      const params: any = {
        order: "asc",
        page,
        limit,
      };

      if (sort === "unassigned") {
        params.filter = "unassigned";
      } else if (sort !== "default") {
        params.sort = sort;
      }

      const response = await axios.get(`${baseUrl}/employees`, {
        headers: { Authorization: token },
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching employees:", error);
      return null;
    }
  }, []);

  const fetchAndSetUsers = async (page: number, sort: string) => {
    setLoading(true);
    const data = await getUsers(page, sort);
    if (data) {
      setUserDetails({
        totalUsers: data.totalEmployees,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      });
      setEmployees(data.results);
    }
    setLoading(false);
  };

  return { getUsers, fetchAndSetUsers };
};

export default useGetUsers;
