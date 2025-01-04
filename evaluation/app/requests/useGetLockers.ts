import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "./NetworkAddress";
import { useCallback } from "react";

const useGetLockers = () => {
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

  return { getLockers };
};

export default useGetLockers;
