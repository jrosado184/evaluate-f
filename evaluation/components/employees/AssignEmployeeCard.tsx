import React from "react";
import { View, Text } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

interface Props {
  name: string;
  employeeId: string;
  position: string;
  department: string;
  dateOfHire: string;
  assigned: boolean;
}

const AssignEmployeeCard = ({
  name,
  employeeId,
  position,
  department,
  dateOfHire,
  assigned,
  ...item
}: any) => {
  return (
    <View className="w-[90vw] h-28 bg-white border border-gray-400 rounded-lg px-4 py-3 mb-3">
      <View className="flex-row justify-between items-start h-full">
        {/* LEFT SIDE */}
        <View className="justify-start gap-y-1">
          <Text className="text-[1.3rem] font-inter-medium">
            {item?.employee_name}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-800">{position}</Text>
            <Entypo
              name="dot-single"
              size={14}
              color="black"
              style={{ marginHorizontal: 2 }}
            />
            <Text className="text-sm text-gray-800">{department}</Text>
          </View>
          <Text className="text-[13px] text-gray-600 mt-[2px]">
            ID: {item?.employee_id}
          </Text>
        </View>

        {/* RIGHT SIDE */}
        <View className="h-full items-end justify-between py-[2px]">
          <Text className="text-[13px] text-gray-600">
            Hired: {item?.date_of_hire}
          </Text>
          <View className="flex-1 justify-center ">
            <Text
              className={`text-xs px-3 py-[3px] rounded-md font-inter-medium ${
                assigned
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {assigned ? "Assigned" : "Unassigned"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AssignEmployeeCard;
