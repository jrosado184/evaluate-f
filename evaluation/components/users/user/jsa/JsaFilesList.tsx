import React, { useCallback, useEffect, useRef, useState } from "react";

import { Text, View } from "react-native";

import Icon from "react-native-vector-icons/Feather";

import SinglePressTouchable from "@/app/utils/SinglePress";

import { loadJsaAssignmentsRequest } from "@/app/requests/jsas/loadJsaAssigments";

import useEmployeeContext from "@/app/context/EmployeeContext";

type Props = {
  onOpenJsa?: (jsaId: string) => void;
};

const JsaFilesList = ({ onOpenJsa }: Props) => {
  const { employee } = useEmployeeContext();

  const [jsaFiles, setJsaFiles] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const latestRequestRef = useRef(0);

  const employeeId = employee?._id;

  const loadJsas = useCallback(async () => {
    if (!employeeId) {
      return;
    }

    const requestId = latestRequestRef.current + 1;

    latestRequestRef.current = requestId;

    try {
      setLoading(true);

      const records = await loadJsaAssignmentsRequest({
        employeeId: String(employeeId),
      });

      if (latestRequestRef.current !== requestId) {
        return;
      }

      setJsaFiles(records || []);
    } catch (error: any) {
      if (latestRequestRef.current !== requestId) {
        return;
      }

      console.error("FAILED TO LOAD JSAS:", error?.response?.data || error);

      setJsaFiles([]);
    } finally {
      if (latestRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [employeeId]);

  useEffect(() => {
    loadJsas();

    return () => {
      latestRequestRef.current += 1;
    };
  }, [loadJsas]);

  if (loading) {
    return (
      <View className="rounded-xl border border-neutral-200 bg-white px-4 py-5">
        <Text className="text-sm text-neutral-500">Loading JSA files...</Text>
      </View>
    );
  }

  if (jsaFiles.length === 0) {
    return (
      <View className="rounded-xl border border-neutral-200 bg-white px-4 py-6">
        <Text className="text-sm text-neutral-500">
          No JSA assignments found.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {jsaFiles.map((file) => {
        const jsaId = file.jsaId || file._id;

        return (
          <SinglePressTouchable
            key={file._id}
            onPress={() => onOpenJsa?.(String(jsaId))}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text
                  numberOfLines={1}
                  className="text-base font-semibold text-neutral-950"
                >
                  {file.jsaName || "JSA File"}
                </Text>

                <Text className="mt-2 text-sm text-neutral-500">
                  Status: {file.status || "Assigned"}
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="mr-3 rounded-full bg-blue-50 px-3 py-1">
                  <Text className="text-xs font-semibold text-blue-700">
                    JSA
                  </Text>
                </View>

                <Icon name="chevron-right" size={18} color="#9CA3AF" />
              </View>
            </View>
          </SinglePressTouchable>
        );
      })}
    </View>
  );
};

export default JsaFilesList;
