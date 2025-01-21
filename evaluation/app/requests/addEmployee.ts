import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "./NetworkAddress";
import axios from "axios";

const addEmployee = async (addEmployeeInfo: any) => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();
  axios
    .post(`${baseUrl}/employees/`, addEmployeeInfo, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      throw new Error(error);
    });
};

export default addEmployee;
