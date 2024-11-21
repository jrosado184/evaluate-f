import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "./NetworkAddress";

const getusers = async (setEmployees: any) => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();
  axios
    .get(`${baseUrl}/employees`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      setEmployees(res.data);
    })
    .catch((error) => {
      console.log(error);
    });
};

export default getusers;
