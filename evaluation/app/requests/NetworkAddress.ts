import Constants from "expo-constants";

const getServerIP = async () => {
  if (!__DEV__) {
    const localIP = Constants.expoConfig?.hostUri?.split(":")[0];
    const localUrl = `http://${localIP}:9000/api`;
    console.log("[getServerIP] Dev mode. Using local server at:", localUrl);
    return localUrl;
  }

  const prodUrl = Constants.expoConfig?.extra?.PROD_API_URL;
  console.log("[getServerIP] Prod mode. PROD_API_URL:", prodUrl);
  return prodUrl || "";
};

export default getServerIP;
