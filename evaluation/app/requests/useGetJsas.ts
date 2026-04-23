import { useCallback } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import axios from "axios";

import getServerIP from "./NetworkAddress";

const useGetJsas = () => {
  const getJsas = useCallback(
    async (
      page = 1,

      limit = 8,

      search?: string,

      department?: string,

      active?: boolean,
    ) => {
      try {
        const token = await AsyncStorage.getItem("token");

        const baseUrl = await getServerIP();

        const response = await axios.get(`${baseUrl}/jsas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          params: {
            page,

            limit,

            search,

            department,

            active,
          },
        });

        return response.data;
      } catch (error) {
        console.error("Error fetching JSA's:", error);

        return null;
      }
    },

    [],
  );

  return { getJsas };
};

export default useGetJsas;
