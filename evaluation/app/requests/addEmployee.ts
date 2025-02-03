import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "./NetworkAddress";
import axios from "axios";
const addEmployee = async (addEmployeeInfo: any) => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();

  try {
    const response = await axios.post(
      `${baseUrl}/employees/`,
      addEmployeeInfo,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return response;
  } catch (error: any) {
    return error.response;
  }
};

export default addEmployee;
