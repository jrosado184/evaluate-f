import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "./NetworkAddress";
import axios from "axios";
import useEmployeeContext from "../context/EmployeeContext";

const addEmployee = async () => {
  const { addEmployeeInfo } = useEmployeeContext();
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();
  axios
    .post(`${baseUrl}/employees/`, addEmployeeInfo, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((error) => {
      throw new Error(error);
    });
};

export default addEmployee;
