import { View, Text } from "react-native";
import React, { memo } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import Icon from "react-native-vector-icons/Feather";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { router } from "expo-router";
import { formatCustomDate } from "@/app/conversions/ConvertDateToString";

interface UserCardTypes {
  position: string | undefined;
  name: string | undefined;
  department: string | undefined;
  employee_id: any;
  date_of_hire: any;
  last_update: string;
  locker_number: string | undefined;
  status: string;
  button?: string;
  knife_number: number | any;
}

const UserCard: React.FC<UserCardTypes> = ({
  position,
  name,
  department,
  employee_id,
  last_update,
  locker_number,
  date_of_hire,
  button,
}) => {
  return (
    <View className="w-full px-1 mb-2">
      <View className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <View className="flex-row justify-between items-start">
          {/* LEFT SIDE */}
          <View className="flex-1 pr-4">
            <Text className="text-xl font-semibold text-black leading-6 mb-1">
              {name}
            </Text>
            <View className="flex-row items-center mb-1">
              <Text className="text-base text-neutral-700">{position}</Text>
              <Entypo name="dot-single" size={18} color="#D1D5DB" />
              <Text className="text-base text-neutral-700">{department}</Text>
            </View>
            <Text className="text-sm text-neutral-500 mb-1">
              ID: {employee_id}
            </Text>
            <Text className="text-sm text-neutral-400 mt-4">
              Updated: {last_update}
            </Text>
          </View>

          {/* RIGHT SIDE */}
          <View className="items-end justify-between h-full min-h-[88]">
            <View>
              <Text className="text-base text-neutral-500">
                Hired: <Text className="font-medium">{date_of_hire}</Text>
              </Text>
              <View className=" items-end justify-end">
                <Text className="text-base text-neutral-500 mt-1">
                  Locker:{" "}
                  <Text className="font-semibold text-black">
                    {locker_number || "—"}
                  </Text>
                </Text>
              </View>
            </View>

            <View className="mt-auto">
              {button === "arrow" ? (
                <MaterialCommunityIcons
                  name="arrow-right-circle"
                  size={26}
                  color="#1a237e"
                />
              ) : (
                <SinglePressTouchable
                  onPress={() => router.push(`/(tabs)/users/update_user`)}
                  activeOpacity={0.8}
                >
                  <Icon name="edit-3" size={20} color="#6B7280" />
                </SinglePressTouchable>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(UserCard);
