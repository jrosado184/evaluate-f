import getServerIP from "@/app/requests/NetworkAddress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { handleUrlParams } from "expo-router/build/fork/getStateFromPath-forks";
import React, { memo, useEffect, useState } from "react";
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
  jsa,
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
  const employeePosition = item?.position || position || "";
  const employeeDepartment = item?.department || department || "";
  const hireDate = item?.date_of_hire || dateOfHire || "";
  const avatarTheme = getAvatarTheme(employeeName);

  const [assignedJsasId, setAssignedJsasId] = useState<any>([]);

  useEffect(() => {
    if (!item?._id) return;

    let isMounted = true;

    const getJsaByEmployeeId = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const response = await axios.get(
          `${baseUrl}/${item._id}/employee-jsas`,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        if (!isMounted) return;
        setAssignedJsasId(response?.data);
      } catch (error: any) {
        if (!isMounted) return;
        console.error(
          "Failed to fetch employee JSAs:",
          error?.response?.data || error,
        );
      }
    };

    getJsaByEmployeeId();

    return () => {
      isMounted = false;
    };
  }, [item?._id]);

  const assignedJsaIds = new Set(
    assignedJsasId?.data?.map((item: any) => String(item.jsaId)) || [],
  );

  const hasJsaAssigned = assignedJsaIds.has(String(jsa?._id));

  return (
    <View className="w-full mb-3.5">
      <View className="w-full rounded-[22px] border border-gray-200 bg-white px-4 py-4">
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

            {(!!employeePosition || !!employeeDepartment) && (
              <View className="flex-row items-center flex-wrap">
                {!!employeePosition && (
                  <Text
                    numberOfLines={1}
                    className="text-[13px] font-medium text-gray-500"
                  >
                    {employeePosition}
                  </Text>
                )}

                {!!employeePosition && !!employeeDepartment && (
                  <Text className="mx-1.5 text-[13px] text-gray-300">•</Text>
                )}

                {!!employeeDepartment && (
                  <Text
                    numberOfLines={1}
                    className="text-[13px] font-medium text-gray-500"
                  >
                    {employeeDepartment}
                  </Text>
                )}
              </View>
            )}
          </View>

          {hasJsaAssigned ? (
            <View className="h-8 w-24 items-center justify-center rounded-full bg-emerald-100">
              <Text className="font-inter text-[.9rem] text-emerald-700">
                Assigned
              </Text>
            </View>
          ) : (
            ""
          )}
        </View>

        <View className="my-3.5 h-px bg-gray-100" />

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
              {!hasJsaAssigned ? "Select" : "View"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(AssignEmployeeCard);
