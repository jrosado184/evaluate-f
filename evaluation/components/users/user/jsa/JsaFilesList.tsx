import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

import SinglePressTouchable from "@/app/utils/SinglePress";
import { loadJsaAssignmentsRequest } from "@/app/requests/jsas/loadJsaAssigments";
import useEmployeeContext from "@/app/context/EmployeeContext";

type JsaFile = {
  _id?: string;
  jsaId?: string;
  jsaName?: string;
  name?: string;
  status?: string;
  department?: string;
  position?: string;
  assignedAt?: string;
  completedAt?: string;
};

type Props = {
  files?: JsaFile[];
  onOpenJsa?: (jsaId: string) => void;
  onCountChange?: (count: number) => void;
  onLoadingChange?: (loading: boolean) => void;
  showEmptyState?: boolean;
};

const JsaFilesList = ({
  files,
  onOpenJsa,
  onCountChange,
  onLoadingChange,
  showEmptyState = true,
}: Props) => {
  const { employee } = useEmployeeContext();

  const [localFiles, setLocalFiles] = useState<JsaFile[]>([]);
  const [loading, setLoading] = useState(false);

  const latestRequestRef = useRef(0);

  const employeeId = employee?._id;
  const shouldFetch = files === undefined;
  const jsaFiles = shouldFetch ? localFiles : files;

  const updateLoading = useCallback(
    (nextLoading: boolean) => {
      setLoading(nextLoading);
      onLoadingChange?.(nextLoading);
    },
    [onLoadingChange],
  );

  const updateFiles = useCallback(
    (nextFiles: JsaFile[]) => {
      setLocalFiles(nextFiles);
      onCountChange?.(nextFiles.length);
    },
    [onCountChange],
  );

  const loadJsas = useCallback(async () => {
    if (!employeeId || !shouldFetch) {
      onCountChange?.(files?.length ?? 0);
      return;
    }

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    try {
      updateLoading(true);

      const records = await loadJsaAssignmentsRequest({
        employeeId: String(employeeId),
      });

      if (latestRequestRef.current !== requestId) return;

      const nextFiles = Array.isArray(records) ? records : [];
      updateFiles(nextFiles);
    } catch (error: any) {
      if (latestRequestRef.current !== requestId) return;

      console.error("FAILED TO LOAD JSAS:", error?.response?.data || error);
      updateFiles([]);
    } finally {
      if (latestRequestRef.current === requestId) {
        updateLoading(false);
      }
    }
  }, [
    employeeId,
    files?.length,
    onCountChange,
    shouldFetch,
    updateFiles,
    updateLoading,
  ]);

  useEffect(() => {
    loadJsas();

    return () => {
      latestRequestRef.current += 1;
    };
  }, [loadJsas]);

  useEffect(() => {
    if (!shouldFetch) {
      onCountChange?.(files?.length ?? 0);
      onLoadingChange?.(false);
    }
  }, [files?.length, onCountChange, onLoadingChange, shouldFetch]);

  if (loading) {
    return (
      <View className="rounded-xl border border-neutral-200 bg-white px-4 py-5">
        <Text className="text-sm font-inter-regular text-neutral-500">
          Loading JSA files...
        </Text>
      </View>
    );
  }

  if (jsaFiles.length === 0) {
    if (!showEmptyState) return null;

    return (
      <View className="rounded-xl border border-neutral-200 bg-white px-4 py-6">
        <Text className="text-sm font-inter-regular text-neutral-500">
          No JSA assignments found.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {jsaFiles.map((file, index) => {
        const jsaId = file.jsaId || file._id;
        const title = file.jsaName || file.name || "JSA File";
        const status = file.status || "Assigned";

        return (
          <SinglePressTouchable
            key={file._id || file.jsaId || `${title}-${index}`}
            onPress={() => {
              if (!jsaId) return;
              onOpenJsa?.(String(jsaId));
            }}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text
                  numberOfLines={1}
                  className="text-base font-inter-semibold text-neutral-950"
                >
                  {title}
                </Text>

                {!!file.department && (
                  <Text
                    numberOfLines={1}
                    className="mt-1 text-xs font-inter-regular text-neutral-500"
                  >
                    {file.department}
                  </Text>
                )}

                <Text className="mt-2 text-sm font-inter-regular text-neutral-500">
                  Status: {status}
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="mr-3 rounded-full bg-blue-50 px-3 py-1">
                  <Text className="text-xs font-inter-semibold text-blue-700">
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
