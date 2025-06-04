// LockerCard.tsx
import { View, Text } from "react-native";
import React from "react";
import WarningIcon from "@/constants/icons/WarningIcon";
import CheckIcon from "@/constants/icons/CheckIcon";
import RightIcon from "@/constants/icons/RightIcon";
import Gender from "react-native-vector-icons/MaterialIcons";
import SinglePressTouchable from "@/app/utils/SinglePress";
import Icon from "react-native-vector-icons/Feather";

interface LockerCardTypes {
  button: "arrow" | "edit" | undefined;
  status?: string;
  locker_number: any;
  Assigned_to?: string;
  assigned_by?: string;
  last_updated?: string;
  vacant?: boolean;
  location?: string;
  onAssignPress?: () => void;
  onUnassignPress?: () => void;
}

const LockerCard: React.FC<LockerCardTypes> = ({
  button,
  locker_number,
  Assigned_to,
  status,
  assigned_by,
  last_updated,
  vacant,
  location,
  onAssignPress,
  onUnassignPress,
}) => {
  return (
    <View className="w-full items-center bg-white">
      <View className="border border-gray-400 w-[100%] h-40 rounded-lg">
        <View className="flex-row justify-between h-full">
          {/* LEFT SECTION */}
          <View className="justify-around h-full pl-4">
            <View className="gap-y-1">
              <Text className="text-[1.4rem] font-inter-medium">
                Locker: <Text className="font-inter-bold">{locker_number}</Text>
              </Text>
              <View className="flex-row items-center">
                <Text className={`w-54 ${vacant && "invisible"}`}>
                  {`Occupied by: ${Assigned_to}`}
                </Text>
              </View>
              <Text
                className={`text-neutral-600 text-sm ${vacant && "invisible"}`}
              >
                {`Assigned by ${assigned_by}`}
              </Text>
            </View>
            <View className="flex-row items-center gap-x-2">
              <Text className="text-[1rem] text-neutral-900 font-inter-medium">
                <Text className="font-inter-medium">Location: </Text>
                <Text className="font-inter-bold">{location}</Text>
              </Text>
              {button === "edit" && !vacant && (
                <SinglePressTouchable
                  activeOpacity={0.8}
                  className="w-9 h-9 justify-center items-center rounded-md"
                  onPress={onAssignPress}
                >
                  <Icon name="edit-3" size={18} color="#333" />
                </SinglePressTouchable>
              )}
            </View>
          </View>

          {/* RIGHT SECTION */}
          <View className="h-full justify-around items-end pr-4 w-32">
            <View className="gap-y-2 items-end my-2">
              <View className="flex-row gap-3 items-center">
                <View
                  className={`w-20 h-7 rounded-lg items-center justify-center border border-neutral-500 ${
                    !vacant && "invisible"
                  }`}
                >
                  <Text className="font-inter-medium text-sm">Vacant</Text>
                </View>
                <Gender
                  color={
                    location?.split(" ")[1] === "Mens" ? "#005FCC" : "#E91E63"
                  }
                  name={location?.split(" ")[1] === "Mens" ? "male" : "female"}
                  size={24}
                />
                {status === "Damaged" ? <WarningIcon /> : <CheckIcon />}
              </View>
            </View>

            {/* ACTIONS */}
            {button === "arrow" && !vacant ? (
              <RightIcon />
            ) : (
              <>
                {vacant && (
                  <SinglePressTouchable
                    activeOpacity={0.8}
                    className="w-24 h-9 border border-gray-500 justify-center items-center rounded-md"
                    onPress={onAssignPress}
                  >
                    <Text className="text-gray-700">Assign</Text>
                  </SinglePressTouchable>
                )}
                {!vacant && (
                  <SinglePressTouchable
                    activeOpacity={0.8}
                    onPress={onUnassignPress}
                  ></SinglePressTouchable>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default LockerCard;
