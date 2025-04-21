import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "./NetworkAddress";
import useEmployeeContext from "../context/EmployeeContext";

const useGetLockers = () => {
  const { setLockerDetails, setLockers, setLoading } = useEmployeeContext();

  // Return an un-memoized function that accepts location as argument
  const getLockers = async (
    page = 1,
    limit = 4,
    location?: string
  ): Promise<any> => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();

    try {
      const response = await axios.get(`${baseUrl}/lockers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit,
          location,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching lockers:", error);
      return null;
    }
  };

  return { getLockers };
};

export default useGetLockers;
