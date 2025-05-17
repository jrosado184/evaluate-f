import Constants from "expo-constants";

const getServerIP = async () => {
  if (__DEV__) {
    const prodUrl = Constants.expoConfig?.extra?.PROD_API_URL;
    const localIP = Constants.expoConfig?.hostUri?.split(":")[0];
    const devUrl = `http://${localIP}:9000/api`;
    console.log("[getServerIP] Running in DEV mode. Using local URL:", devUrl);
    return prodUrl;
  }

  const prodUrl = Constants.expoConfig?.extra?.PROD_API_URL;
  console.log(
    "[getServerIP] Running in PROD mode. Using PROD_API_URL:",
    prodUrl || "Not defined"
  );
  return prodUrl || "";
};

export default getServerIP;
