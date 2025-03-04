import axios from "axios";
import getServerIP from "./NetworkAddress";
import AsyncStorage from "@react-native-async-storage/async-storage";

const updateEmployee = async (addEmployeeInfo: any, id: any) => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();
  try {
    const response = await axios.put(
      `${baseUrl}/employees/${id}`,
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

export default updateEmployee;
