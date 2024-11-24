import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "./NetworkAddress";

const getusers = async (setEmployees: any, setLoading: any) => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();
  setLoading(true);
  axios
    .get(`${baseUrl}/employees`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      setEmployees(res.data);
      setLoading(false);
    })
    .catch((error) => {
      console.log(error);
    });
};

export default getusers;
