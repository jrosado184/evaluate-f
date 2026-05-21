import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import SelectionSheet from "@/components/ui/sheets/SelectionSheet";
import JsaQuestions from "./JsaQuestions";
import useEmployeeContext from "@/app/context/EmployeeContext";
import ViewCompletedJsa from "./ViewCompletedJsa";

type Props = {
  view: "employeeSelection" | "AssignJSA" | "viewCompletedJsa";
  setView: (
    view: "employeeSelection" | "AssignJSA" | "viewCompletedJsa",
  ) => void;
  jsa: any;
  onClose: () => void;
  onSuccess: () => void;
};

const JsaAssignmentSheetContent = ({
  view,
  setView,
  jsa,
  onSuccess,
}: Props) => {
  const { setEmployee } = useEmployeeContext();

  const handleSelectEmployee = async (
    selectedEmployee: any,
    nextView: "AssignJSA" | "viewCompletedJsa",
  ) => {
    setEmployee(selectedEmployee);
    setView(nextView);
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
          jsa={jsa}
          mode="employees"
          searchPlaceholderLabel="employees"
          emptyTitle="No employees found"
          emptyDescription="Try searching by employee name or ID."
          handleSelectedEmployee={handleSelectEmployee}
        />
      </View>
    );
  }

  if (view === "AssignJSA") {
    return <JsaQuestions jsa={jsa} onSuccess={onSuccess} />;
  }

  if (view === "viewCompletedJsa") {
    return <ViewCompletedJsa jsa={jsa} />;
  }

  return null;
};

export default JsaAssignmentSheetContent;
