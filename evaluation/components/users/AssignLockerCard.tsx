import React from "react";
import { View, Text } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SinglePressTouchable from "@/app/utils/SinglePress";

interface Props {
  locker_number: number | string;
  location: string;
  vacant: boolean;
  status?: string;
  assigned_employee?: any;
  assigned_by?: string;
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

const AssignLockerCard: React.FC<Props> = ({
  locker_number,
  location,
  vacant,
  assigned_employee,
  assigned_by,
  onPress,
}) => {
  const theme = getLockerTheme(locker_number);
  const isVacant = !!vacant;

  return (
    <SinglePressTouchable
      onPress={onPress}
      activeOpacity={0.85}
      className="mb-3.5 w-full"
    >
      <View className="w-full rounded-[22px] border border-gray-200 bg-white px-4 py-4">
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

          <View className="ml-2 h-10 w-10 items-center justify-center">
            <SimpleLineIcons name="arrow-right" size={18} color="#6B7280" />
          </View>
        </View>

        <View className="my-3.5 h-px bg-gray-100" />

        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-[13px] text-gray-400" numberOfLines={1}>
              Occupied by:{" "}
              <Text className="font-semibold text-gray-500">
                {!isVacant && assigned_employee?.employee_name
                  ? assigned_employee.employee_name
                  : "—"}
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
    </SinglePressTouchable>
  );
};

export default AssignLockerCard;
