import { useEffect } from "react";
import axios from "axios";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useAxios401Interceptor = () => {
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response.status === 401) {
          return;
        }

        if (error?.response?.status === 403) {
          await AsyncStorage.removeItem("token");

          setTimeout(() => {
            router.replace("/sign-in");
          }, 100);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
};

export default useAxios401Interceptor;
