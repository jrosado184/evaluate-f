import { View, Text, ScrollView } from "react-native";
import React from "react";
import Header from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import LeftButton from "@/components/LeftButton";
import LockerCard from "@/components/LockerCard";
import Activity from "@/components/Activity";
const Locker = () => {
  return (
    <SafeAreaView className="p-5 bg-neutral-50 h-full">
      <Header />
      <LeftButton />
      <View>
        <LockerCard
          button="arrow"
          locker_number="456"
          occupant="Javier Rosado"
          assigned_by="Juan Guerrero"
          last_update="May 11, 2008"
        />
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
    </SafeAreaView>
  );
};

export default Locker;
