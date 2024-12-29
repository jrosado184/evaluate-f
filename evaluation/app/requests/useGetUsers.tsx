import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "./NetworkAddress";
import useEmployeeContext from "../context/EmployeeContext";
import { useCallback, useEffect, useState } from "react";

const useGetUsers = () => {
  const { sortingBy } = useEmployeeContext();

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

  return { getUsers };
};

export default useGetUsers;
