import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import Header from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import LeftButton from "@/components/LeftButton";
import LockerCard from "@/components/LockerCard";
import Activity from "@/components/Activity";
import RNPickerSelect from "react-native-picker-select";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Locker = () => {
  const [status, setStatus] = useState("Functional");
  const pickerRef = useRef<RNPickerSelect | null>(null);

  return (
    <SafeAreaView className="p-5 bg-neutral-50 h-full">
      <Header />
      <LeftButton />
      <View>
        <LockerCard
          button="update"
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
      <View>
        <Text className="font-inter-semibold text-[1.2rem]">Status</Text>
        <TouchableOpacity
          onPress={() => {
            pickerRef.current && pickerRef.current.togglePicker();
          }}
          activeOpacity={1}
        >
          <View className="border border-black h-14 rounded-md my-3 flex-row items-center relative">
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
                  paddingVertical: 21,
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
    </SafeAreaView>
  );
};

export default Locker;
