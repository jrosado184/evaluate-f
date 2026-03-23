import React, { memo } from "react";
import { View, Text } from "react-native";

type AssignEmployeeCardProps = {
  name?: string;
  employeeId?: string | number;
  position?: string;
  department?: string;
  dateOfHire?: string;
  assigned?: boolean;
  source?: string;
  [key: string]: any;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const avatarThemes = [
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
];

const getAvatarTheme = (name: string) =>
  avatarThemes[(name?.charCodeAt(0) || 65) % avatarThemes.length];

const AssignEmployeeCard = ({
  name,
  employeeId,
  position,
  department,
  dateOfHire,
  assigned,
  source,
  ...item
}: AssignEmployeeCardProps) => {
  const employeeName = item?.employee_name || name || "";
  const id = item?.employee_id || employeeId || "";
  const hireDate = item?.date_of_hire || dateOfHire || "";
  const avatarTheme = getAvatarTheme(employeeName);

  return (
    <View className="w-full mb-3.5">
      <View className="w-full rounded-[22px] border border-gray-200 bg-white px-4 py-4">
        {/* Top */}
        <View className="flex-row items-center">
          <View
            className={`h-[46px] w-[46px] items-center justify-center rounded-[14px] ${avatarTheme.bg}`}
          >
            <Text
              className={`text-[14px] font-bold tracking-[0.4px] ${avatarTheme.text}`}
            >
              {getInitials(employeeName || "?")}
            </Text>
          </View>

          <View className="ml-3 flex-1 pr-2">
            <Text
              numberOfLines={1}
              className="mb-1 text-[17px] font-bold text-gray-900"
            >
              {employeeName}
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

          {source !== "evaluations" && source !== "dashboard" && (
            <View
              className={`ml-2 flex-row items-center rounded-full px-2.5 py-1 ${
                assigned ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              <View
                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                  assigned ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <Text
                className={`text-[11px] font-semibold ${
                  assigned ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {assigned ? "Assigned" : "Unassigned"}
              </Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View className="my-3.5 h-px bg-gray-100" />

        {/* Bottom */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            {!!id && (
              <Text className="mb-1 text-[13px] text-gray-400">
                ID: <Text className="font-semibold text-gray-500">{id}</Text>
              </Text>
            )}
            {!!hireDate && (
              <Text className="text-[13px] text-gray-400">
                Hired:{" "}
                <Text className="font-semibold text-gray-500">{hireDate}</Text>
              </Text>
            )}
          </View>

          <View className="min-w-[84px] items-center justify-center rounded-full border border-gray-300 bg-gray-100 px-4 py-2">
            <Text className="text-[13px] font-semibold text-gray-700">
              Select
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(AssignEmployeeCard);
