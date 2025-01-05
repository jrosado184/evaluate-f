import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "./NetworkAddress";
import { useCallback } from "react";
import useEmployeeContext from "../context/EmployeeContext";

const useGetLockers = () => {
  const { setLockerDetails, setLockers, setLoading } = useEmployeeContext();
  const getLockers = useCallback(async (page = 1, limit = 4) => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();

    try {
      const response = await axios.get(`${baseUrl}/lockers`, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is prefixed properly
        },
        params: {
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching lockers:", error);
      return null;
    }
  }, []);

  const fetchAndSetLockers = async (page: any, limit: any) => {
    const data = await getLockers(page, limit);
    if (data) {
      setLockerDetails({
        totalUsers: data.totalEmployees,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      });
      setLockers(() => {
        setLoading(false);
        if (page === 1) {
          return data.results;
        }
      });
    }
  };

  return { getLockers, fetchAndSetLockers };
};

export default useGetLockers;
