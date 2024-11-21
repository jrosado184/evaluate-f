import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { router } from "expo-router";
import UserCard from "@/components/UserCard";
import Search from "@/components/Search";
import LockerCard from "@/components/LockerCard";
import VacantCard from "@/components/VacantCard";
import getusers from "@/app/requests/getUsers";
import useEmployeeContext from "@/app/context/GlobalContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";

const Lockers = () => {
  const { employees, setEmployees } = useEmployeeContext();
  useEffect(() => {
    getusers(setEmployees);
  }, []);
  return (
    <SafeAreaView className="p-6 bg-neutral-50">
      <Text className="pl-2 font-inter-medium text-[2rem]">Lockers</Text>
      <Search total="lockers" />
      <ScrollView>
        <View className="pb-[10rem] gap-y-3">
          {employees.map((locker, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(`/lockers/${locker._id}`)}
              activeOpacity={0.8}
            >
              <LockerCard
                button="arrow"
                locker_number={locker.locker_number}
                occupant={locker.employee_name}
                assigned_by={locker.assigned_by}
                last_updated={formatISODate(locker.last_updated)}
              />
              {/* <VacantCard
                button="Assign"
                locker_number="456"
                assigned_by="Juan Guerrero"
                last_updated="May 11, 2008"
              /> */}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Lockers;
