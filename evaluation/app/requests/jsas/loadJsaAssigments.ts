import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import getServerIP from "@/app/requests/NetworkAddress";

type LoadJsaAssignmentsParams = {
  jsaId?: string;
  employeeId?: string;
};

export const loadJsaAssignmentsRequest = async ({
  jsaId,
  employeeId,
}: LoadJsaAssignmentsParams = {}) => {
  const token = await AsyncStorage.getItem("token");

  const baseUrl = await getServerIP();

  const params = new URLSearchParams();

  if (jsaId) {
    params.append("jsaId", jsaId);
  }

  if (employeeId) {
    params.append("employeeId", employeeId);
  }

  const response = await axios.get(
    `${baseUrl}/employee-jsas?${params.toString()}`,
    {
      headers: {
        Authorization: token!,
      },
    },
  );

  return Array.isArray(response.data)
    ? response.data
    : response?.data?.data || [];
};
