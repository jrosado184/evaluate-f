import Constants from "expo-constants";

const getServerIP = async () => {
  if (__DEV__) {
    const localIP = Constants.expoConfig?.hostUri?.split(":")[0];
    const localUrl = `http://${localIP}:9000/api`;
    return localUrl;
  }

  const prodUrl =
    Constants.expoConfig?.extra?.PROD_API_URL ||
    "https://api.javy-tech.org/api";
  return prodUrl || "";
};

export default getServerIP;
