import React, { memo } from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SinglePressTouchable from "@/app/utils/SinglePress";

interface LockerCardTypes {
  button?: "arrow" | "edit";
  status?: string;
  locker_number?: string | number;
  assigned_to?: string;
  assigned_by?: string;
  last_updated?: string;
  vacant?: boolean;
  location?: string;
  onAssignPress?: () => void;
  onUnassignPress?: () => void;
  onPress?: () => void;
}

const lockerThemes = [
  { bg: "bg-violet-100", icon: "#6D28D9" },
  { bg: "bg-blue-100", icon: "#1D4ED8" },
  { bg: "bg-emerald-100", icon: "#047857" },
  { bg: "bg-rose-100", icon: "#BE185D" },
  { bg: "bg-amber-100", icon: "#B45309" },
  { bg: "bg-pink-100", icon: "#BE185D" },
];

const getLockerTheme = (num: string | number | undefined) =>
  lockerThemes[(parseInt(String(num ?? "0"), 10) || 0) % lockerThemes.length];

const LockerCard: React.FC<LockerCardTypes> = ({
  button,
  locker_number,
  assigned_to,
  assigned_by,
  last_updated,
  vacant,
  location,
  onAssignPress,
  onUnassignPress,
  onPress,
}) => {
  const theme = getLockerTheme(locker_number);
  const isVacant = !!vacant;

  return (
    <View className="w-full mb-3.5">
      <View className="w-full rounded-[22px] border border-gray-200 bg-white px-4 py-4">
        {/* Top */}
        <View className="flex-row items-center">
          <View
            className={`h-[46px] w-[46px] items-center justify-center rounded-[14px] ${theme.bg}`}
          >
            <MaterialCommunityIcons
              name="locker-multiple"
              size={20}
              color={theme.icon}
            />
          </View>

          <View className="ml-3 flex-1 pr-3">
            <Text
              numberOfLines={1}
              className="mb-1 text-[17px] font-bold text-gray-900"
            >
              Locker {locker_number}
            </Text>

            <View className="flex-row items-center flex-wrap">
              {!!location && (
                <Text
                  numberOfLines={1}
                  className="text-[13px] font-medium text-gray-500"
                >
                  {location}
                </Text>
              )}

              {!!location && (
                <Text className="mx-1.5 text-[13px] text-gray-300">•</Text>
              )}

              <Text
                className={`text-[13px] font-medium ${
                  isVacant ? "text-emerald-600" : "text-yellow-600"
                }`}
              >
                {isVacant ? "Vacant" : "Occupied"}
              </Text>
            </View>
          </View>

          <View className="ml-2">
            {isVacant ? (
              <SinglePressTouchable onPress={onAssignPress} activeOpacity={0.8}>
                <View className="items-center justify-center rounded-full border border-gray-300 bg-gray-100 px-4 py-2">
                  <Text className="text-[13px] font-semibold text-gray-700">
                    Assign
                  </Text>
                </View>
              </SinglePressTouchable>
            ) : button === "arrow" ? (
              <SinglePressTouchable onPress={onPress} activeOpacity={0.8}>
                <View className="h-10 w-10 items-center justify-center">
                  <SimpleLineIcons
                    name="arrow-right"
                    size={18}
                    color="#6B7280"
                  />
                </View>
              </SinglePressTouchable>
            ) : (
              <SinglePressTouchable
                onPress={onUnassignPress}
                activeOpacity={0.8}
              >
                <View className="h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50">
                  <Icon name="minus" size={18} color="#DC2626" />
                </View>
              </SinglePressTouchable>
            )}
          </View>
        </View>

        {/* Divider */}
        <View className="my-3.5 h-px bg-gray-100" />

        {/* Bottom */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-[13px] text-gray-400" numberOfLines={1}>
              Occupied by:{" "}
              <Text className="font-semibold text-gray-500">
                {!isVacant && assigned_to ? assigned_to : "—"}
              </Text>
            </Text>
          </View>

          <Text className="mb-1 text-[13px] text-gray-400" numberOfLines={1}>
            Assigned by:{" "}
            <Text className="font-semibold text-gray-500">
              {!isVacant && assigned_by ? assigned_by : "—"}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default memo(LockerCard);
