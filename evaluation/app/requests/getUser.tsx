import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "./NetworkAddress";

export const getUser = async (setEmployee: any, id: any) => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();
  axios
    .get(`${baseUrl}/employees/${id}`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      setEmployee(res.data);
      return res.data;
    })
    .catch((error) => {
      throw new Error(error);
    });
};

export default getUser;
