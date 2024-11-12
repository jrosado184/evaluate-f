import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import WarningIcon from "@/constants/icons/WarningIcon";
import CheckIcon from "@/constants/icons/CheckIcon";
import RightIcon from "@/constants/icons/RightIcon";

interface LockerCardTypes {
  button: string;
  status?: string;
  locker_number: string;
  occupant: string;
  assigned_by: string;
  last_update: string;
}

/**
 * UserCard component that displays user information.
 *
 * @param {string} button - Arrow or Update button
 * @param {string} status - Current status of the user
 * @param {string} locker_number - Assigned locker number
 * @param {string} occupant - Person who occupies the locker
 * @param {string} assigned_by - Person who assigned the locker
 * @param {string} last_update - Last update timestamp
 */

const LockerCard: React.FC<LockerCardTypes> = ({
  button,
  status,
  locker_number,
  occupant,
  assigned_by,
  last_update,
}) => {
  return (
    <View className="w-full items-center bg-neutral-50">
      <View className="border border-gray-400 w-[100%] h-40 rounded-lg">
        <View className="flex-row justify-between h-full">
          <View className="justify-around h-full pl-4">
            <View className="gap-y-1">
              <Text className="text-[1.4rem] font-inter-medium">
                Locker: <Text className="font-inter-bold">{locker_number}</Text>
              </Text>
              <View className="flex-row items-center">
                <Text>{`Occupied by ${occupant}`}</Text>
              </View>
              <Text className="text-neutral-600 text-sm">
                {`Assigned by ${assigned_by}`}{" "}
              </Text>
            </View>
            <Text className="text-[.9rem] text-neutral-700">
              Last updated: {last_update}
            </Text>
          </View>
          <View className="h-full justify-around items-end pr-4">
            <View className="gap-y-2 items-end">
              {status === "Damaged" ? <WarningIcon /> : <CheckIcon />}
            </View>
            {button === "arrow" ? (
              <RightIcon />
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                className="w-28 h-10 border border-gray-500 justify-center items-center rounded-md my-2"
              >
                <Text>Update</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default LockerCard;
