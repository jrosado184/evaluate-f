// src/requests/unassignLocker.ts
import axios from "axios";
import getServerIP from "@/app/requests/NetworkAddress";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function unassignLocker(lockerId: string) {
  const baseUrl = await getServerIP();
  const token = await AsyncStorage.getItem("token");
  return axios.post(
    `${baseUrl}/lockers/unassign`,
    { lockerId },
    { headers: { Authorization: token! } }
  );
}
