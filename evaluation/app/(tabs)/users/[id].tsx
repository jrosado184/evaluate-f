import { View, Text, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useGlobalSearchParams } from "expo-router";
import UserCard from "@/components/UserCard";
import Activity from "@/components/Activity";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import CardSkeleton from "@/app/skeletons/CardSkeleton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import axios from "axios";
import Icon from "react-native-vector-icons/Feather";

const User = () => {
  const { id } = useGlobalSearchParams();
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
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
            setAddEmployeeInfo(res.data);
            return res.data;
          })
          .catch((error) => {
            throw new Error(error);
          });
      };
      getUser();
      return () => {
        setAddEmployeeInfo("");
      };
    }, [])
  );

  return (
    <SafeAreaView className="p-6 bg-neutral-50 h-full">
      <TouchableOpacity
        onPress={router.back}
        className="flex-row items-center h-10"
      >
        <Icon name="chevron-left" size={29} />
        <Text className="text-[1.3rem]">Back</Text>
      </TouchableOpacity>
      <View className="my-4">
        {loading ? (
          <CardSkeleton amount={1} width="w-full" height="h-40" />
        ) : (
          <UserCard
            name={employee?.employee_name}
            employee_id={employee?.employee_id}
            locker_number={employee?.locker_number}
            knife_number={employee?.knife_number}
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
