import { View, Text, TouchableOpacity } from "react-native";
import React, { memo, useCallback } from "react";
import RightIcon from "@/constants/icons/RightIcon";
import WarningIcon from "@/constants/icons/WarningIcon";
import Entypo from "@expo/vector-icons/Entypo";
import CheckIcon from "@/constants/icons/CheckIcon";

/**
 * Props for the UserCard component
 */
interface UserCardTypes {
  /** Position of the user in the company */
  position: string | undefined;
  /** Full name of the user */
  name: string | undefined;
  /** Department the user belongs to */
  department: string | undefined;
  /** Unique employee ID */
  employee_id: string | undefined;
  /** Last update timestamp */
  last_update: string;
  /** Assigned locker number */
  locker_number: string | undefined;
  /** Status of the user */
  status: string;
  button?: string;
}

/**
 * UserCard component that displays user information.
 *
 * @param {string} position - Position of the user in the company
 * @param {string} name - Full name of the user
 * @param {string} department - Department the user belongs to
 * @param {string} employee_id - Unique employee ID
 * @param {string} last_update - Last update timestamp
 * @param {string} locker_number - Assigned locker number
 * @param {string} status - Current status of the user
 * @param {string} button - Arrow or update button
 */
const UserCard: React.FC<UserCardTypes> = ({
  position,
  name,
  department,
  employee_id,
  last_update,
  locker_number,
  status,
  button,
}) => {
  return (
    <View className="w-full items-center">
      <View className="border border-gray-400 w-[100%] h-40 rounded-lg">
        <View className="flex-row justify-between h-full">
          <View className="justify-around h-full pl-4">
            <View className="gap-y-1">
              <Text className="text-[1.4rem] font-inter-medium">{name}</Text>
              <View className="flex-row items-center">
                <Text>{position}</Text>
                <Entypo name="dot-single" size={16} color="black" />
                <Text>{department}</Text>
              </View>
              <Text>ID: {employee_id}</Text>
            </View>
            <Text className="text-[.9rem] text-neutral-700">
              Last updated: {last_update}
            </Text>
          </View>
          <View className="h-full justify-around items-end pr-4">
            <View className="gap-y-2 items-end">
              {status === "Damaged" ? <WarningIcon /> : <CheckIcon />}
              <Text className="font-inter-regular">
                Locker: <Text className="font-inter-bold">{locker_number}</Text>
              </Text>
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

export default memo(UserCard);
