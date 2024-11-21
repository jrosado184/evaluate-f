import * as Network from "expo-network";
import Constants from "expo-constants";

const getServerIP = async () => {
  const localIP = Constants.expoConfig?.hostUri?.split(":")[0];
  return `http://${localIP}:9000/api`;
};

export default getServerIP;
