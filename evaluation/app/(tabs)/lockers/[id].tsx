import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import LeftButton from "@/components/LeftButton";
import LockerCard from "@/components/LockerCard";
import Activity from "@/components/Activity";
import RNPickerSelect from "react-native-picker-select";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import VacantCard from "@/components/VacantCard";
import { useGlobalSearchParams } from "expo-router";
import useEmployeeContext from "@/app/context/GlobalContext";
import { getUser } from "@/app/requests/getUser";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";

const Locker = () => {
  const [status, setStatus] = useState("Functional");
  const pickerRef = useRef<RNPickerSelect | null>(null);

  const { id } = useGlobalSearchParams();

  const { employee, setEmployee } = useEmployeeContext();

  useEffect(() => {
    getUser(setEmployee, id);
  }, []);

  return (
    <SafeAreaView className="p-6 bg-neutral-50 h-full">
      <LeftButton />
      <View>
        <LockerCard
          vacant={false}
          button="update"
          locker_number={employee?.locker_number}
          occupant={employee?.employee_name}
          assigned_by={employee?.assigned_by}
          last_updated={formatISODate(employee?.last_updated)}
        />
        {/* <VacantCard
          status="Damaged"
          locker_number="0056"
          button="Assign"
          last_updated="June 4, 2022"
          assigned_by="Juan Guerrero"
        /> */}
      </View>
      <View className="my-5">
        <Text className="font-inter-semibold text-[1.2rem]">History</Text>
        <ScrollView>
          <Activity
            name="Brenda Perez"
            title="Marked locker number 876 damaged"
          />
        </ScrollView>
      </View>
      <View>
        <Text className="font-inter-semibold text-[1.2rem]">Status</Text>
        <TouchableOpacity
          onPress={() => {
            pickerRef.current && pickerRef.current.togglePicker();
          }}
          activeOpacity={1}
        >
          <View className="border border-gray-400 h-14 rounded-md my-3 flex-row items-center relative">
            <RNPickerSelect
              onValueChange={(value) => setStatus(value)}
              items={[
                { label: "Functional", value: "Functional" },
                { label: "Damaged", value: "Damaged" },
              ]}
              value={status}
              useNativeAndroidPickerStyle={false}
              ref={pickerRef}
              style={{
                inputIOS: {
                  paddingVertical: 22,
                  paddingHorizontal: 10,
                  color: "black",
                  flex: 1,
                  textAlign: "center",
                },
                inputAndroid: {
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  color: "black",
                  flex: 1,
                  textAlign: "center",
                },
              }}
              Icon={() => null}
            />
            <View
              style={{
                position: "absolute",
                right: 10,
              }}
            >
              <MaterialCommunityIcons
                name="chevron-down"
                size={24}
                color="gray"
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View className="py-36 items-center justify-center">
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-32 h-10 border border-red-500 justify-center items-center rounded-md my-2"
        >
          <Text className="text-red-500">Delete user</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Locker;
