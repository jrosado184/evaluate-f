import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import getServerIP from "./NetworkAddress";
import axios from "axios";

export const loadJobOptions = async ({
  query = "",
  page = 1,
  signal,
}: { query?: string; page?: number; signal?: AbortSignal } = {}) => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();

  const resp = await axios.get(`${baseUrl}/tasks/options`, {
    headers: { Authorization: token! },
    params: { q: query, page, limit: 50 },
    signal,
  });
  return resp.data;
};
