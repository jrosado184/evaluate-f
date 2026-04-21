import React, { memo } from "react";
import { Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

type JsaCardProps = {
  name?: string;
  position?: string;
  department?: string;
  questionsCount?: number;
};

const JsaCard: React.FC<JsaCardProps> = ({
  name,
  position,
  department,
  questionsCount,
}) => {
  return (
    <View className="w-full mb-3.5">
      <View className="w-full rounded-[22px] border border-gray-200 bg-white px-4 py-4">
        {/* Top */}
        <View className="flex-row items-start">
          <View className="h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-blue-50 border border-blue-100">
            <MaterialCommunityIcons
              name="file-document-outline"
              size={22}
              color="#2563EB"
            />
          </View>

          <View className="ml-3 flex-1 pr-3">
            <Text
              numberOfLines={2}
              className="mb-1 text-[16px] font-bold text-gray-900"
            >
              {name || "Unnamed JSA"}
            </Text>

            {(!!position || !!department) && (
              <View className="flex-row items-center flex-wrap">
                {!!position && (
                  <Text className="text-[13px] font-medium text-gray-500">
                    {position}
                  </Text>
                )}

                {!!position && !!department && (
                  <Text className="mx-1.5 text-[13px] text-gray-300">•</Text>
                )}

                {!!department && (
                  <Text className="text-[13px] font-medium text-gray-500">
                    {department}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View className="ml-2 mt-1">
            <SimpleLineIcons name="arrow-right" size={18} color="#6B7280" />
          </View>
        </View>

        {/* Divider */}
        <View className="my-3.5 h-px bg-gray-100" />

        {/* Bottom */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={16}
              color="#9CA3AF"
            />
            <Text className="ml-1.5 text-[13px] text-gray-400">
              Safety Analysis
            </Text>
          </View>

          <View className="rounded-full bg-gray-100 px-3 py-1">
            <Text className="text-[12px] font-semibold text-gray-600">
              {questionsCount ?? 0} questions
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(JsaCard);
