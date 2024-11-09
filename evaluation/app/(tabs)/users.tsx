import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import FormField from "@/components/FormField";
import UserCard from "@/components/UserCard";

const users = () => {
  const handleSearch = () => {};
  return (
    <SafeAreaView className="p-6 bg-neutral-50">
      <Header />
      <View className="w-full items-center justify-start">
        <FormField
          styles="rounded-full w-[100%]"
          value=""
          placeholder="Search..."
          handleChangeText={handleSearch}
          rounded="rounded-full h-14"
          inputStyles="pl-5 text-[1.1rem]"
        />
        <View className="justify-between items-center w-[100%] flex-row my-4">
          <Text className="pl-2 text-neutral-500">Total users: 1609</Text>
          <View className="gap-2 flex-row items-center">
            <Text>Sort By</Text>
            <TouchableOpacity className="w-24 mr-2 h-8 border border-gray-400 rounded-lg items-center justify-center">
              <Text className="text-sm">Last Name</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView>
        <View className="pb-[10rem] gap-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <UserCard
              key={index} // Use the index as a unique key for each item
              position="Trainer"
              name="Javier Rosado"
              department="Fabrication"
              employee_id={3169322 + index} // Optional: Add the index to make each ID unique
              last_update="January 24, 2024"
              locker_number={830 + index} // Optional: Add the index to make each locker number unique
              status="Damaged"
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default users;
