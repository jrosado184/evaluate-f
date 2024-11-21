import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import UserCard from "@/components/UserCard";
import { router } from "expo-router";
import Search from "@/components/Search";
import useEmployeeContext from "@/app/context/GlobalContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import getusers from "@/app/requests/getUsers";
const Users = () => {
  const { employees, setEmployees } = useEmployeeContext();

  useEffect(() => {
    getusers(setEmployees);
  }, []);

  return (
    <SafeAreaView className="p-6 bg-neutral-50">
      <Text className="pl-2 font-inter-medium text-[2rem]">Users</Text>
      <Search total="users" />
      <ScrollView>
        <View className="pb-[10rem] gap-y-3">
          {employees.map((employee, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(`/users/${employee._id}`)}
              activeOpacity={0.8}
            >
              <UserCard
                key={index + 1}
                position={employee.position}
                name={employee.employee_name}
                department={employee.department}
                employee_id={employee.employee_id}
                last_update={formatISODate(employee.last_updated)}
                locker_number={employee.locker_number}
                status=""
                button="arrow"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Users;
