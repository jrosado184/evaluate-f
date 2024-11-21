import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import WarningIcon from "@/constants/icons/WarningIcon";
import CheckIcon from "@/constants/icons/CheckIcon";
import RightIcon from "@/constants/icons/RightIcon";

interface LockerCardTypes {
  button: string | undefined;
  status?: string | undefined;
  locker_number: number | undefined;
  occupant: string | undefined;
  assigned_by: string | undefined;
  last_updated: string | undefined;
  vacant?: boolean | undefined;
}

/**
 * UserCard component that displays user information.
 *
 * @param {string} button - Arrow or Update button
 * @param {string} status - Current status of the user
 * @param {number} locker_number - Assigned locker number
 * @param {string} occupant - Person who occupies the locker
 * @param {string} assigned_by - Person who assigned the locker
 * @param {string} last_updated - Last update timestamp
 * @param {boolean} vacant - Current status of occupancy
 *
 */

const LockerCard: React.FC<LockerCardTypes> = ({
  button,
  status,
  locker_number,
  occupant,
  assigned_by,
  last_updated,
  vacant,
}) => {
  return (
    <View className="w-full items-center bg-neutral-50">
      <View className="border border-gray-400 w-[100%] h-40 rounded-lg">
        {!vacant ? (
          <View className="flex-row justify-between h-full">
            <View className="justify-around h-full pl-4">
              <View className="gap-y-1">
                <Text className="text-[1.4rem] font-inter-medium">
                  Locker: {""}
                  <Text className="font-inter-bold">{locker_number}</Text>
                </Text>
                <View className="flex-row items-center">
                  <Text>{`Occupied by ${occupant}`}</Text>
                </View>
                <Text className="text-neutral-600 text-sm">
                  {`Assigned by ${assigned_by}`}
                </Text>
              </View>
              <Text className="text-[.9rem] text-neutral-700">
                Last updated: {last_updated}
              </Text>
            </View>
            <View className="h-full justify-between py-4 items-end pr-4">
              <View className="gap-y-2 items-end">
                {status === "Damaged" ? <WarningIcon /> : <CheckIcon />}
              </View>
              {button === "arrow" ? (
                <RightIcon />
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="w-28 h-10 border border-gray-500 justify-center items-center rounded-md"
                >
                  <Text>Update</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center gap-3">
            <View className="gap-y-2 items-end w-full pr-4">
              {status === "Damaged" ? <WarningIcon /> : <CheckIcon />}
            </View>
            <Text className="font-inter-medium text-[1.1rem]">
              Locker <Text className="font-inter-bold">398</Text> is vacant
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              className="w-36 h-10 border border-gray-500 justify-center items-center rounded-md"
            >
              <Text>Assign Locker</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default LockerCard;
