import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import FormField from "@/components/FormField";
import UserCard from "@/components/UserCard";
import { router } from "expo-router";
import Search from "@/components/Search";

const Users = () => {
  return (
    <SafeAreaView className="p-6 bg-neutral-50">
      <Header />
      <Search />
      <ScrollView>
        <View className="pb-[10rem] gap-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(`/users/${index + 1}`)}
              activeOpacity={0.8}
            >
              <UserCard
                key={index + 1}
                position="Trainer"
                name="Javier Rosado"
                department="Fabrication"
                employee_id={3169322 + index}
                last_update="January 24, 2024"
                locker_number={830 + index}
                status="Damaged"
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
