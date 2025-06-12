import { View, Text } from "react-native";
import React, { memo } from "react";
import WarningIcon from "@/constants/icons/WarningIcon";
import CheckIcon from "@/constants/icons/CheckIcon";
import RightIcon from "@/constants/icons/RightIcon";
import Gender from "react-native-vector-icons/MaterialIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import SinglePressTouchable from "@/app/utils/SinglePress";

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
  assigned_by,
  last_updated,
  vacant,
  location,
  onAssignPress,
  onUnassignPress,
}) => {
  const genderColor = location?.toLowerCase().includes("mens")
    ? "#005FCC"
    : "#E91E63";
  const genderIcon = location?.toLowerCase().includes("mens")
    ? "male"
    : "female";

  return (
    <View className="w-full px-1 mb-2">
      <View className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm h-40">
        <View className="flex-row justify-between h-full">
          {/* LEFT SIDE */}
          <View className="flex-1 justify-between pr-3">
            <View>
              <Text className="text-xl font-semibold text-black mb-1">
                Locker: {locker_number}
              </Text>

              {!vacant && (
                <>
                  <Text
                    className="text-base text-neutral-700"
                    numberOfLines={1}
                  >
                    Occupied by: {Assigned_to}
                  </Text>
                  <Text
                    className="text-sm text-neutral-500 mb-1"
                    numberOfLines={1}
                  >
                    Assigned by: {assigned_by}
                  </Text>
                </>
              )}
            </View>

            <Text className="text-sm text-neutral-400">
              Updated: {last_updated}
            </Text>
          </View>

          {/* RIGHT SIDE */}
          <View className="justify-between items-end h-full">
            {/* Top: Location + Gender + Status */}
            <View className="flex-row items-center gap-2">
              <Text
                className="text-sm font-medium"
                style={{ color: genderColor }}
                numberOfLines={1}
              >
                {location}
              </Text>
            </View>

            {/* Bottom: Button */}
            {vacant ? (
              <SinglePressTouchable
                activeOpacity={0.8}
                className="w-24 h-9 border border-gray-500 justify-center items-center rounded-md"
                onPress={onAssignPress}
              >
                <Text className="text-gray-700 text-sm">Assign</Text>
              </SinglePressTouchable>
            ) : button === "arrow" ? (
              <MaterialCommunityIcons
                name="arrow-right-circle"
                size={26}
                color="#1a237e"
              />
            ) : (
              <SinglePressTouchable onPress={onAssignPress}>
                <Icon name="edit-3" size={20} color="#6B7280" />
              </SinglePressTouchable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(LockerCard);
