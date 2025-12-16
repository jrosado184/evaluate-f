import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import getServerIP from "./NetworkAddress";
import axios from "axios";

export const loadJobOptions = async ({
  query = "",
  page = 1,
  signal,
  includeNewHires = false,
}: {
  includeNewHires?: boolean;
  query?: string;
  page?: number;
  signal?: AbortSignal;
}) => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();

  const resp = await axios.get(`${baseUrl}/tasks/options`, {
    headers: { Authorization: token! },
    params: { q: query, page, limit: 50 },
    signal,
  });

  if (includeNewHires) {
    return resp.data;
  }

  const EXCLUDED_CODES = new Set(["50211", "50212"]);

  const filteredResults = (resp.data.results || []).filter(
    (job: any) =>
      !job?.children?.matching_task_codes?.some((task: any) =>
        EXCLUDED_CODES.has(String(task))
      )
  );

  return {
    ...resp.data,
    results: filteredResults,
  };
};

export const loadSupervisorsOptions = async ({
  query = "",
  page = 1,
  signal,
}: { query?: string; page?: number; signal?: AbortSignal } = {}) => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();

  const resp = await axios.get(`${baseUrl}/management`, {
    headers: { Authorization: token! },
    params: { q: query, page, limit: 50 },
    signal,
  });

  return resp.data;
};

export const loadDepartmentOptions = async () => {
  const token = await AsyncStorage.getItem("token");
  const baseUrl = await getServerIP();
  const resp = await axios.get(`${baseUrl}/departments/options`, {
    headers: { Authorization: token! },
  });

  return (
    resp.data?.results?.map((d: any) => ({
      ...d,
      label:
        d?.children?.custom_name ||
        d?.children?.local_name ||
        d?.children?.department_name ||
        d?.children?.sap_description ||
        d.label,
    })) ?? []
  );
};
