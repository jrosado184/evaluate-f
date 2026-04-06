import React, { memo } from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { router } from "expo-router";
import { getAvatarMeta } from "@/app/helpers/avatar";

interface UserCardTypes {
  position?: string;
  name?: string;
  department?: string;
  employee_id?: string | number;
  date_of_hire?: string;
  last_update?: string;
  locker_number?: string;
  button?: string;
  knife_number?: number | string;
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
  const { initials, bg, text } = getAvatarMeta(name);

  return (
    <View className="w-full mb-3.5">
      <View className="w-full rounded-[22px] border border-gray-200 bg-white px-4 py-4">
        {/* Top */}
        <View className="flex-row items-center">
          <View
            className={`h-[46px] w-[46px] items-center justify-center rounded-[14px] ${bg}`}
          >
            <Text className={`text-[14px] font-bold tracking-[0.4px] ${text}`}>
              {initials || "?"}
            </Text>
          </View>

          <View className="ml-3 flex-1 pr-3">
            <Text
              numberOfLines={1}
              className="mb-1 text-[17px] font-bold text-gray-900"
            >
              {name}
            </Text>

            {(!!position || !!department) && (
              <View className="flex-row items-center flex-wrap">
                {!!position && (
                  <Text
                    numberOfLines={1}
                    className="text-[13px] font-medium text-gray-500"
                  >
                    {position}
                  </Text>
                )}

                {!!position && !!department && (
                  <Text className="mx-1.5 text-[13px] text-gray-300">•</Text>
                )}

                {!!department && (
                  <Text
                    numberOfLines={1}
                    className="text-[13px] font-medium text-gray-500"
                  >
                    {department}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View className="ml-2">
            {button === "arrow" ? (
              <SimpleLineIcons name="arrow-right" size={18} color="#6B7280" />
            ) : (
              <SinglePressTouchable
                onPress={() => router.push(`/(tabs)/users/update_user`)}
                activeOpacity={0.8}
              >
                <View className="h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-100">
                  <Icon name="edit-3" size={17} color="#4B5563" />
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
            {!!employee_id && (
              <Text className="mb-1 text-[13px] text-gray-400">
                ID:{" "}
                <Text className="font-semibold text-gray-500">
                  {employee_id}
                </Text>
              </Text>
            )}

            <Text className="text-[13px] text-gray-400">
              Locker:{" "}
              <Text className="font-semibold text-gray-500">
                {locker_number || "—"}
              </Text>
            </Text>
          </View>

          <View className="items-end">
            {!!date_of_hire && (
              <Text className="mb-1 text-[13px] text-gray-400">
                Hired:{" "}
                <Text className="font-semibold text-gray-500">
                  {date_of_hire}
                </Text>
              </Text>
            )}

            {!!last_update && (
              <Text className="text-[13px] text-gray-400">
                Updated:{" "}
                <Text className="font-semibold text-gray-500">
                  {last_update}
                </Text>
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(UserCard);
