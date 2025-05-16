import { View, Text, TouchableOpacity } from "react-native";
import React, { memo, useEffect } from "react";
import RightIcon from "@/constants/icons/RightIcon";
import WarningIcon from "@/constants/icons/WarningIcon";
import Entypo from "@expo/vector-icons/Entypo";
import CheckIcon from "@/constants/icons/CheckIcon";
import Icon from "react-native-vector-icons/Feather";
import { router, useGlobalSearchParams } from "expo-router";

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
  employee_id: any;
  /** Last update timestamp */
  last_update: string;
  /** Assigned locker number */
  locker_number: string | undefined;
  /** Status of the user */
  status: string;
  button?: string;
  knife_number: number | any;
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
  knife_number,
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
          <View className="flex-row justify-between h-full">
            <View className="justify-around items-end h-full pr-4">
              <View className="gap-y-1 items-end my-1">
                <View className="h-[1.7rem] items-center justify-center pr-1">
                  {status === "Damaged" ? <WarningIcon /> : <CheckIcon />}
                </View>
                <View className="flex-row items-center">
                  <Text className="font-inter-regular">
                    Locker:
                    <Text className="font-inter-semibold">{locker_number}</Text>
                  </Text>
                  <Text></Text>
                </View>
                <Text></Text>
              </View>
              <View>
                <View className="pb-1">
                  {button === "arrow" ? (
                    <RightIcon />
                  ) : (
                    <TouchableOpacity
                      onPress={() => router.push(`/(tabs)/users/update_user`)}
                      activeOpacity={0.8}
                    >
                      <Icon name="edit-3" size={20} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(UserCard);
