import { View, Text } from "react-native";
import React, { Ref, useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalSearchParams } from "expo-router";
import LeftButton from "@/components/LeftButton";
import UserCard from "@/components/UserCard";
import Activity from "@/components/Activity";
import useEmployeeContext from "@/app/context/GlobalContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import { getUser } from "@/app/requests/getUser";
import CardSkeleton from "@/app/skeletons/CardSkeleton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import axios from "axios";

const User = () => {
  const { id } = useGlobalSearchParams();
  const { employee, setEmployee } = useEmployeeContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      axios
        .get(`${baseUrl}/employees/${id}`, {
          headers: {
            Authorization: token,
          },
        })
        .then((res) => {
          setLoading(false);
          setEmployee(res.data);
          return res.data;
        })
        .catch((error) => {
          throw new Error(error);
        });
    };
    getUser();
  }, []);

  return (
    <SafeAreaView className="p-6 bg-neutral-50 h-full">
      <LeftButton />
      <View>
        {loading ? (
          <CardSkeleton amount={1} width="w-full" height="h-40" />
        ) : (
          <UserCard
            name={employee?.employee_name}
            employee_id={employee?.employee_id}
            locker_number={employee?.locker_number}
            position={employee?.position}
            department={employee?.department}
            last_update={formatISODate(employee?.last_updated)}
            status="Damaged"
          />
        )}
      </View>
      <View className="my-5">
        <Text className="font-inter-semibold text-[1.2rem]">History</Text>
        {loading ? (
          <View className="my-3">
            <CardSkeleton amount={1} width="w-full" height="h-[4.5rem]" />
          </View>
        ) : (
          <Activity
            name="Brenda Perez"
            title="Assigned locker number 006 to John Brown"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default User;
