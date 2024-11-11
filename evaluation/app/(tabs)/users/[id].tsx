import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalSearchParams } from "expo-router";
import Header from "@/components/Header";
import LeftButton from "@/components/LeftButton";
import UserCard from "@/components/UserCard";
import Activity from "@/components/Activity";

const User = () => {
  const { id } = useGlobalSearchParams();
  return (
    <SafeAreaView className="p-5">
      <Header />
      <LeftButton />
      <View>
        <UserCard
          name="Javier Rosado"
          employee_id={3169322}
          locker_number="0098"
          position="Trim Heel Meat"
          department="Fabrication"
          last_update="March 6, 2024"
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
