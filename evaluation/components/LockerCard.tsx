import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import WarningIcon from "@/constants/icons/WarningIcon";
import CheckIcon from "@/constants/icons/CheckIcon";
import RightIcon from "@/constants/icons/RightIcon";
import Gender from "react-native-vector-icons/MaterialIcons";

interface LockerCardTypes {
  button: string | undefined;
  status?: string | undefined;
  locker_number: any;
  Assigned_to: string | undefined;
  assigned_by: string | undefined;
  last_updated: string | undefined;
  vacant?: boolean | undefined;
  location?: string;
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
 * @param {boolean} location - Location of locker
 *
 */

const LockerCard: React.FC<LockerCardTypes> = ({
  button,
  locker_number,
  Assigned_to,
  status,
  assigned_by,
  last_updated,
  vacant,
  location,
}) => {
  return (
    <View className="w-full items-center bg-white">
      <View className="border border-gray-400 w-[100%] h-40 rounded-lg">
        <View className="flex-row justify-between h-full">
          <View className="justify-around h-full pl-4">
            <View className="gap-y-1">
              <Text className="text-[1.4rem] font-inter-medium">
                Locker: {""}
                <Text className="font-inter-bold">{locker_number}</Text>
              </Text>
              <View className="flex-row items-center">
                <Text
                  className={`w-54 ${vacant && "invisible"}`}
                >{`Occupied by: ${Assigned_to}`}</Text>
              </View>
              <Text
                className={`text-neutral-600 text-sm ${vacant && "invisible"}`}
              >
                {`Assigned by ${assigned_by}`}
              </Text>
            </View>
            <Text className="text-[1rem] text-neutral-900 font-inter-medium">
              <Text className="font-inter-medium">Location: </Text>
              <Text className="font-inter-bold">{location}</Text>
            </Text>
          </View>
          <View className="h-full justify-around items-end pr-4 w-20">
            <View className="gap-y-2 items-end my-2">
              <View className="flex-row gap-3 items-center">
                <View
                  className={`w-20 h-7 rounded-lg items-center justify-center border border-neutral-500 ${
                    !vacant && "invisible"
                  }`}
                >
                  <Text className={`font-inter-medium text-sm`}>Vacant</Text>
                </View>
                <View>
                  <Gender
                    color={
                      location?.split(" ")[1] === "Mens" ? "#005FCC" : "#E91E63"
                    }
                    name={
                      location?.split(" ")[1] === "Mens" ? "male" : "female"
                    }
                    size={24}
                  />
                </View>
                {status === "Damaged" ? <WarningIcon /> : <CheckIcon />}
              </View>
              <Text className="font-inter-regular"> {""}</Text>
            </View>
            {button === "arrow" && !vacant ? (
              <RightIcon />
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                className="w-24 h-9 border border-gray-500 justify-center items-center rounded-md my-2"
              >
                <Text>{vacant ? "Assign" : "Update"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default LockerCard;
