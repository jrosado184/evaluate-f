import { View, Text } from "react-native";
import React from "react";
import Activity from "./Activity";
import SinglePressTouchable from "@/app/utils/SinglePress";
`1234`;

const Activities = () => {
  return (
    <View className="w-full h-full">
      <Text className="font-inter-semibold text-[1.2rem]">Recent activity</Text>
      <Activity
        name="Javier Rosado"
        title="Assigned locker number 008 to John Brown"
      />
      <Activity
        name="Juan Guerrero"
        title="Assigned locker number 008 to John Brown"
      />
      <Activity
        name="Brenda Perez"
        title="Assigned locker number 008 to John Brown"
      />
      <SinglePressTouchable
        activeOpacity={0.8}
        className="w-28 h-10 border border-gray-400 justify-center items-center rounded-md my-2"
      >
        <Text>View all</Text>
      </SinglePressTouchable>
    </View>
  );
};

export default Activities;
