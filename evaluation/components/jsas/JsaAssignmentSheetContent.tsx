import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";

import SelectionSheet from "@/components/ui/sheets/SelectionSheet";
import getServerIP from "@/app/requests/NetworkAddress";
import SinglePressTouchable from "@/app/utils/SinglePress";
import FormField from "../FormField";

type Props = {
  view: "employeeSelection" | "confirmAssignment";
  setView: (view: "employeeSelection" | "confirmAssignment") => void;
  jsa: any;
  employee: any;
  setEmployee: (employee: any) => void;
  onClose: () => void;
  onSuccess: () => void;
};

const JsaAssignmentSheetContent = ({
  view,
  setView,
  jsa,
  employee,
  setEmployee,
  onSuccess,
}: Props) => {
  const [assigning, setAssigning] = useState(false);

  const handleSelectEmployee = async (selectedEmployee: any) => {
    setEmployee(selectedEmployee);
    setView("confirmAssignment");
  };

  const handleAssignEmployee = async () => {
    if (!employee?._id || !jsa?._id) {
      Alert.alert("Error", "Missing employee or JSA.");
      return;
    }

    try {
      setAssigning(true);

      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      await axios.post(
        `${baseUrl}/employee-jsas`,
        {
          employeeId: employee._id,
          jsaId: jsa._id,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      );

      onSuccess();
    } catch (error: any) {
      console.error("Failed to assign JSA:", error?.response?.data || error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to assign JSA",
      );
    } finally {
      setAssigning(false);
    }
  };

  if (view === "employeeSelection") {
    return (
      <View className="flex-1">
        <View className="px-4 pb-3 pt-2">
          <View className="w-full flex-row items-center rounded-[22px] border border-gray-200 bg-white px-4 py-4">
            <View className="h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-blue-100 bg-blue-50">
              <MaterialCommunityIcons
                name="file-document-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View className="ml-3 flex-1 pr-1">
              <Text
                numberOfLines={2}
                className="mb-1 text-[16px] font-bold text-gray-900"
              >
                {jsa?.name ?? "Selected JSA"}
              </Text>

              {(!!jsa?.position || !!jsa?.department) && (
                <View className="flex-row items-center flex-wrap">
                  {!!jsa?.position && (
                    <Text className="text-[13px] font-medium text-gray-500">
                      {jsa.position}
                    </Text>
                  )}

                  {!!jsa?.position && !!jsa?.department && (
                    <Text className="mx-1.5 text-[13px] text-gray-600">•</Text>
                  )}

                  {!!jsa?.department && (
                    <Text className="text-[13px] font-medium text-gray-500">
                      {jsa.department}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        <SelectionSheet
          mode="employees"
          searchPlaceholderLabel="employees"
          emptyTitle="No employees found"
          emptyDescription="Try searching by employee name or ID."
          onEmployeeSelected={handleSelectEmployee}
        />
      </View>
    );
  }

  if (view === "confirmAssignment") {
    return (
      <ScrollView className="flex-1 px-4 pb-4 pt-2">
        <View className="rounded-[22px] border border-gray-200 bg-white px-4 py-4">
          <View className="flex-row items-start">
            <View className="h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-blue-100 bg-blue-50">
              <MaterialCommunityIcons
                name="file-document-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View className="ml-3 flex-1 pr-1">
              <Text
                numberOfLines={2}
                className="mb-1 text-[16px] font-bold text-gray-900"
              >
                {jsa?.name ?? "Selected JSA"}
              </Text>

              {(!!jsa?.position || !!jsa?.department) && (
                <View className="flex-row items-center flex-wrap">
                  {!!jsa?.position && (
                    <Text className="text-[13px] font-medium text-gray-500">
                      {jsa.position}
                    </Text>
                  )}

                  {!!jsa?.position && !!jsa?.department && (
                    <Text className="mx-1.5 text-[13px] text-gray-300">•</Text>
                  )}

                  {!!jsa?.department && (
                    <Text className="text-[13px] font-medium text-gray-500">
                      {jsa.department}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          <View className="my-3.5 h-px bg-gray-100" />

          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="account-outline"
              size={18}
              color="#6B7280"
            />
            <Text className="ml-2 text-[13px] text-gray-500">Assigning to</Text>
          </View>

          <Text className="mt-2 text-[16px] font-semibold text-gray-900">
            {employee?.employee_name ?? "Selected employee"}
          </Text>

          {(!!employee?.position || !!employee?.department) && (
            <View className="mt-1 flex-row items-center flex-wrap">
              {!!employee?.position && (
                <Text className="text-[13px] font-medium text-gray-500">
                  {employee.position}
                </Text>
              )}

              {!!employee?.position && !!employee?.department && (
                <Text className="mx-1.5 text-[13px] text-gray-300">•</Text>
              )}

              {!!employee?.department && (
                <Text className="text-[13px] font-medium text-gray-500">
                  {employee.department}
                </Text>
              )}
            </View>
          )}
        </View>

        <View className="mt-4 gap-3 pb-20">
          {jsa?.questions?.map((question: any, index: number) => {
            const isTextQuestion = question?.type === "text";

            return (
              <View
                key={question?.order ?? index}
                className="rounded-[20px] border border-gray-200 bg-white px-4 py-4"
              >
                <View className="mb-3 flex-row items-start">
                  <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                    <Text className="text-[12px] font-semibold text-blue-600">
                      {index + 1}
                    </Text>
                  </View>

                  <Text className="flex-1 font-inter-medium text-[14px] leading-5 text-gray-900">
                    {question?.question}
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  {isTextQuestion ? (
                    <>
                      <SinglePressTouchable
                        activeOpacity={0.85}
                        className="flex-1"
                        onPress={() => {}}
                      >
                        <View className="min-h-[48px] flex-row items-center justify-center rounded-[16px] border border-gray-200 bg-gray-50 px-3">
                          <Text className="text-[14px] font-medium text-gray-700">
                            Myself
                          </Text>
                        </View>
                      </SinglePressTouchable>

                      <SinglePressTouchable
                        activeOpacity={0.85}
                        className="flex-1"
                        onPress={() => {}}
                      >
                        <View className="min-h-[48px] flex-row items-center justify-center rounded-[16px] border border-gray-200 bg-gray-50 px-3">
                          <Text className="text-center text-[14px] font-medium text-gray-700">
                            My supervisor
                          </Text>
                        </View>
                      </SinglePressTouchable>
                    </>
                  ) : (
                    <>
                      <SinglePressTouchable
                        activeOpacity={0.85}
                        className="flex-1"
                        onPress={() => {}}
                      >
                        <View className="min-h-[48px] flex-row items-center justify-center rounded-[16px] border border-gray-200 bg-gray-50 px-3">
                          <Text className="text-[14px] font-medium text-gray-700">
                            Yes
                          </Text>
                        </View>
                      </SinglePressTouchable>

                      <SinglePressTouchable
                        activeOpacity={0.85}
                        className="flex-1"
                        onPress={() => {}}
                      >
                        <View className="min-h-[48px] flex-row items-center justify-center rounded-[16px] border border-gray-200 bg-gray-50 px-3">
                          <Text className="text-[14px] font-medium text-gray-700">
                            No
                          </Text>
                        </View>
                      </SinglePressTouchable>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  return null;
};

export default JsaAssignmentSheetContent;
