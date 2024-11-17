import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { router } from "expo-router";
import UserCard from "@/components/UserCard";
import Search from "@/components/Search";
import LockerCard from "@/components/LockerCard";
import VacantCard from "@/components/VacantCard";

const Lockers = () => {
  return (
    <SafeAreaView className="p-6 bg-neutral-50">
      <Text className="pl-2 font-inter-medium text-[2rem]">Lockers</Text>
      <Search />
      <ScrollView>
        <View className="pb-[10rem] gap-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.replace(`/lockers/${index + 1}`)}
              activeOpacity={0.8}
            >
              <LockerCard
                button="arrow"
                locker_number="456"
                occupant="Javier Rosado"
                assigned_by="Juan Guerrero"
                last_updated="May 11, 2008"
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
