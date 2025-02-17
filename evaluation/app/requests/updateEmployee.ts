import axios from "axios";
import getServerIP from "./NetworkAddress";
import AsyncStorage from "@react-native-async-storage/async-storage";

const updateEmployee = async (addEmployeeInfo: any, id: any) => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();
  axios
    .put(`${baseUrl}/employees/${id}`, addEmployeeInfo, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      throw new Error(error);
    });
};

export default updateEmployee;
