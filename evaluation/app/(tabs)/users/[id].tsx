import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalSearchParams } from "expo-router";
import LeftButton from "@/components/LeftButton";
import UserCard from "@/components/UserCard";
import Activity from "@/components/Activity";
import useEmployeeContext from "@/app/context/GlobalContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";

const User = () => {
  const { id } = useGlobalSearchParams();
  const { employee, setEmployee } = useEmployeeContext();

  useEffect(() => {
    const getUser = async () => {
      const token = await AsyncStorage.getItem("token");
      axios
        .get(`http://10.0.0.79:9000/api/employees/${id}`, {
          headers: {
            Authorization: token,
          },
        })
        .then((res) => {
          setEmployee(res.data);
        })
        .catch((error) => {
          throw new Error(error);
        });
    };
    getUser();
  }, []);

  return (
    <SafeAreaView className="p-6 bg-neutral-50">
      <LeftButton />
      <View>
        <UserCard
          name={employee?.employee_name}
          employee_id={3169322}
          locker_number={employee?.locker_number}
          position={employee?.position}
          department={employee?.department}
          last_update={formatISODate(employee?.last_updated)}
          status="Damaged"
        />
      </View>
      <View className="my-5">
        <Text className="font-inter-semibold text-[1.2rem]">History</Text>
        <Activity
          name="Brenda Perez"
          title="Assigned locker number 006 to John Brown  "
        />
      </View>
    </SafeAreaView>
  );
};

export default User;
