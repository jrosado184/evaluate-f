import React from "react";
import { View, Text } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface Props {
  locker_number: number;
  location: string;
  vacant: boolean;
  status?: string;
  assigned_employee?: any;
}

const AssignLockerCard: React.FC<Props> = ({
  locker_number,
  location,
  vacant,
  assigned_employee,
}) => {
  const isMens = location?.split(" ")[1] === "Mens";

  return (
    <View className="w-[90vw] h-28 bg-white border border-gray-400 rounded-lg px-4 py-3 mb-3">
      <View className="flex-row justify-between items-start h-full">
        {/* LEFT SIDE */}
        <View className="justify-start gap-y-1">
          <Text className="text-[1.3rem] font-inter-medium">
            Locker: <Text className="font-inter-bold">{locker_number}</Text>
          </Text>
          {!vacant && (
            <>
              <Text className="text-sm text-gray-800">
                Occupied by: {assigned_employee?.employee_name}
              </Text>
            </>
          )}
          <Text className="text-[13px] text-gray-600 mt-[2px]">
            Location: {location}
          </Text>
        </View>

        {/* RIGHT SIDE */}
        <View className="h-full items-end justify-between py-[2px]">
          <MaterialIcons
            name={isMens ? "male" : "female"}
            size={22}
            color={isMens ? "#005FCC" : "#E91E63"}
          />
          <View className="flex-1 justify-center">
            <Text
              className={`text-xs px-3 py-[3px] rounded-md font-inter-medium ${
                vacant
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {vacant ? "Vacant" : "Occupied"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AssignLockerCard;
