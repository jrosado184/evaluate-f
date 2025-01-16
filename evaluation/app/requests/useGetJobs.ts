import { View, Text } from "react-native";
import React, { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "./NetworkAddress";
import axios from "axios";
import useJobsContext from "../context/JobsContext";

const useGetJobs = () => {
  const { setJobs } = useJobsContext();
  const getJobs = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();

    try {
      const response = await axios.get(`${baseUrl}/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is prefixed properly
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return null;
    }
  }, []);

  const fetchJobs = async () => {
    const allJobs = await getJobs();
    if (allJobs) {
      setJobs(allJobs);
    }
  };
  return { fetchJobs };
};

export default useGetJobs;
