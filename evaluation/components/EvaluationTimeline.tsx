import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const EvaluationTimeline = ({ fileData }: any) => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const completedWeeks = new Map(
    fileData.evaluations?.map((e: any) => [e.weekNumber, e]) || []
  );
  const nextAvailableWeek = (() => {
    for (let i = 1; i <= 6; i++) {
      if (!completedWeeks.has(i)) return i;
    }
    return null;
  })();
  const projectedTrainingWeeks =
    fileData.personalInfo.projectedTrainingHours / 40;

  const handleEdit = (weekNumber: number) => {
    router.push(
      `/users/${fileData?.employeeId}/evaluations/${fileData?._id}/week/${weekNumber}`
    );
  };

  const handleStart = (weekNumber: number) => {
    router.push(
      `/users/${fileData?.employeeId}/evaluations/${fileData?._id}/step2?week=${weekNumber}`
    );
  };

  const totalOnJob = fileData.evaluations?.reduce(
    (sum: number, e: any) => sum + (Number(e.totalHoursOnJob) || 0),
    0
  );
  const totalOffJob = fileData.evaluations?.reduce(
    (sum: number, e: any) => sum + (Number(e.totalHoursOffJob) || 0),
    0
  );
  const totalWithTrainee = fileData.evaluations?.reduce(
    (sum: number, e: any) => sum + (Number(e.totalHoursWithTrainee) || 0),
    0
  );

  return (
    <View className="mt-2">
      {Array.from({
        length:
          fileData.status === "complete"
            ? fileData.evaluations.length
            : projectedTrainingWeeks,
      }).map((_, i) => {
        const week = i + 1;
        const evaluation: any = completedWeeks.get(week);
        const nextWeekComplete = completedWeeks.has(week + 1);
        const isComplete = !!evaluation;
        const isNext = week === nextAvailableWeek;

        return (
          <View
            key={week}
            className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 w-[90%] self-center"
          >
            <Text className="text-lg font-semibold mb-3">Week {week}</Text>

            {isComplete ? (
              <>
                <View className="flex-row flex-wrap gap-y-1">
                  <View className="w-1/2 pr-2">
                    <Text className="text-sm text-gray-700">
                      Total Hours on Job:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.totalHoursOnJob ?? "0"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2 pr-2">
                    <Text className="text-sm text-gray-700">
                      Total Hours Off Job:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.totalHoursOffJob ?? "0"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2 pr-2">
                    <Text className="text-sm text-gray-700">
                      Total Hours With Trainee:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.totalHoursWithTrainee ?? "0"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2 pr-2">
                    <Text className="text-sm text-gray-700">
                      Percent Qualified:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.percentQualified ?? "-"}%
                      </Text>
                    </Text>
                  </View>

                  <View className="w-1/2 pr-2 mt-1">
                    <Text className="text-sm text-gray-700">
                      Yield Audit:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.yieldAuditDate || "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2 pr-2 mt-1">
                    <Text className="text-sm text-gray-700">
                      Knife Skills Audit:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.knifeSkillsAuditDate || "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2 pr-2 mt-1">
                    <Text className="text-sm text-gray-700">
                      Knife Score:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.knifeScore ?? "-"}
                      </Text>
                    </Text>
                  </View>

                  <View className="w-1/2 pr-2 mt-1">
                    <Text className="text-sm text-gray-700">
                      Pain/Numbness:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.hasPain ? "Yes" : "No"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2 pr-2 mt-1">
                    <Text className="text-sm text-gray-700">
                      Hand Stretch Completed:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.handStretchCompleted ? "Yes" : "No"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2 pr-2 mt-1">
                    <Text className="text-sm text-gray-700">
                      RE Time Achieved:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.reTimeAchieved ?? "-"} secs
                      </Text>
                    </Text>
                  </View>
                </View>

                {evaluation.comments && (
                  <Text className="text-sm text-gray-500 mt-2">
                    Comments:{" "}
                    <Text className="font-medium text-gray-700">
                      {evaluation.comments}
                    </Text>
                  </Text>
                )}

                {/* Signature previews omitted for brevity */}

                {!nextWeekComplete && !isComplete && (
                  <TouchableOpacity
                    onPress={() => handleEdit(week)}
                    className="mt-4 bg-[#1a237e] px-5 py-3 rounded-md self-start shadow-sm"
                  >
                    <Text className="text-white font-semibold text-sm">
                      Edit
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : isNext && !isComplete ? (
              <TouchableOpacity
                onPress={() => handleStart(week)}
                className="mt-2 bg-emerald-600 px-5 py-3 rounded-md self-start shadow-sm"
              >
                <Text className="text-white font-semibold text-sm">
                  Get Started
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-sm text-gray-400 mt-1">
                Locked until previous week is complete
              </Text>
            )}
          </View>
        );
      })}

      {/* Totals & Final Signatures omitted for brevity */}

      {/* Fullscreen Signature Modal omitted for brevity */}
    </View>
  );
};

export default EvaluationTimeline;
