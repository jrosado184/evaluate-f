import { View, Text } from "react-native";
import React from "react";
import WarningIcon from "@/constants/icons/WarningIcon";
import CheckIcon from "@/constants/icons/CheckIcon";
import SinglePressTouchable from "@/app/utils/SinglePress";

interface VacantCardTypes {
  status: string;
  locker_number: string;
  button: string;
  last_updated: string;
  assigned_by: string;
}

const VacantCard: React.FC<VacantCardTypes> = ({
  locker_number,
  status,
  button,
  last_updated,
  assigned_by,
}) => {
  return (
    <View className="border border-gray-400 w-[100%] h-40 rounded-lg">
      <View className="flex-row justify-between h-full">
        <View className="justify-around h-full pl-4">
          <View className="gap-y-1 h-full py-5 justify-between">
            <View className="gap-1">
              <Text className="text-[1.4rem] font-inter-medium">
                Locker: {""}
                <Text className="font-inter-bold">{locker_number}</Text>
              </Text>
              <Text className="text-neutral-600">{`Marked vacant by ${assigned_by}`}</Text>
            </View>
            <Text className="text-[.9rem] text-neutral-700">
              Last updated: {last_updated}
            </Text>
          </View>
        </View>
        <View className="h-full justify-between py-5 items-end pr-4">
          <View className="gap-y-2 items-end">
            {status === "Damaged" ? <WarningIcon /> : <CheckIcon />}
          </View>
          <SinglePressTouchable
            activeOpacity={0.8}
            className="w-28 h-10 border border-gray-500 justify-center items-center rounded-md"
          >
            <Text>{button}</Text>
          </SinglePressTouchable>
        </View>
      </View>
    </View>
  );
};

export default VacantCard;
