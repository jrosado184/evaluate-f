import React, { useMemo, useState } from "react";
import { View, Text, Image, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import SinglePressTouchable from "@/app/utils/SinglePress";

const EvaluationTimeline = ({ fileData }: any) => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const completedWeeks: any = new Map(
    fileData.evaluations?.map((e: any) => [e.weekNumber, e]) || []
  );

  const projectedTrainingWeeks =
    fileData.personalInfo.projectedTrainingHours / 40;

  const handleEdit = (weekNumber: number) => {
    router.push(`/evaluations/${fileData?._id}/step2?week=${weekNumber}`);
  };

  const handleStart = (weekNumber: number) => {
    router.push(`/evaluations/${fileData?._id}/step2?week=${weekNumber}`);
  };

  const renderSignature = (label: string, uri: string) => (
    <Pressable
      key={label}
      onPress={() => setSelectedImage(uri)}
      className="items-center flex-1"
    >
      <View className="w-32 h-16 bg-neutral-50 border border-neutral-400 rounded-md overflow-hidden">
        <Image
          source={{ uri }}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
      <Text className="text-xs text-gray-400 mt-1">{label}</Text>
    </Pressable>
  );

  // Calculate current total hours
  const totalHoursOnJob = fileData.evaluations?.reduce(
    (sum: number, e: any) => sum + (e.totalHoursOnJob || 0),
    0
  );
  const totalHoursOffJob = fileData.evaluations?.reduce(
    (sum: number, e: any) => sum + (e.totalHoursOffJob || 0),
    0
  );
  const totalHoursWithTrainee = fileData.evaluations?.reduce(
    (sum: number, e: any) => sum + (e.totalHoursWithTrainee || 0),
    0
  );

  const projectedTrainingHours =
    Number(fileData.personalInfo.projectedTrainingHours) || 0;

  /* 2. Memoised onTrack -------------------------------------------------- */
  const onTrack = useMemo(() => {
    if (projectedTrainingHours === 0 || completedWeeks.size === 0) {
      return false;
    }

    /* latest completed week */
    const lastWeekNumber = Math.max(...completedWeeks.keys());
    const currentEval: any = completedWeeks.get(lastWeekNumber) || {};

    /* ---- numbers ------------------------------------------------------ */
    const totalHoursOnJob = Number(currentEval.totalHoursOnJob) || 0;

    /* percentQualified may look like "25" or "25%" → strip % then parse */
    const rawPercent = currentEval?.percentQualified;

    const actualPercentCompleted =
      Number(
        typeof rawPercent === "string"
          ? rawPercent.replace("%", "")
          : rawPercent ?? 0
      ) || 0;

    if (totalHoursOnJob === 0 || actualPercentCompleted === 0) {
      return false;
    }

    /* ---- expected progress so far ------------------------------------ */
    const expectedPercentToDate =
      (totalHoursOnJob / projectedTrainingHours) * 100; // e.g. 40/200 = 20%

    /* on-track when actual ≥ expected */
    const result = actualPercentCompleted >= expectedPercentToDate;

    return result;
  }, [projectedTrainingHours, completedWeeks]);

  return (
    <View className="mt-2">
      {Array.from({
        length:
          fileData.status === "complete"
            ? fileData.evaluations.length
            : Number(totalHoursOnJob) -
                fileData?.evaluations[0].totalHoursOnJob <
              Number(projectedTrainingHours)
            ? fileData.evaluations.length + 1
            : projectedTrainingWeeks,
      }).map((_, i) => {
        const week = i + 1;

        const evaluation: any = completedWeeks.get(week) || {};

        const prevWeekComplete = completedWeeks.has(week - 1) || week === 1;
        const isComplete = completedWeeks.has(week);
        const nextWeekExists = completedWeeks.has(week + 1);
        return (
          <View
            key={week}
            className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 w-[90%] self-center"
          >
            <Text className="text-lg font-semibold mb-3">Week {week}</Text>

            {isComplete && (
              <>
                {/* Key Metrics */}
                <View className="flex-row flex-wrap gap-y-2">
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Total Hours on Job:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.totalHoursOnJob ?? 0}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Total Hours Off Job:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.totalHoursOffJob ?? 0}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Total Hours With Trainee:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.totalHoursWithTrainee ?? 0}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Percent Qualified:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.percentQualified
                          ? `${evaluation?.percentQualified}%`
                          : "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Expected Qualified:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.expectedQualified
                          ? `${evaluation.expectedQualified}%`
                          : "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      RE Time Achieved:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.reTimeAchieved
                          ? evaluation.reTimeAchieved
                          : "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Knife Audit Date:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.knifeSkillsAuditDate
                          ? evaluation.knifeSkillsAuditDate
                          : "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Yield Audit Date:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.yieldAuditDate
                          ? evaluation.yieldAuditDate
                          : "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Knife Score:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.knifeScore ? evaluation.knifeScore : "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Stretch Completed:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.handStretchCompleted ? "Yes" : "No"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Experiencing Pain:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.hasPain ? "Yes" : "No"}
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* Comments */}
                <Text className="text-sm text-gray-500 mt-2">
                  Comments:{" "}
                  <Text className="font-medium text-gray-700">
                    {evaluation.comments ? evaluation.comments : "-"}
                  </Text>
                </Text>

                {/* Signatures */}
                <View className="mt-3 flex-row justify-between gap-4">
                  {evaluation.trainerSignature &&
                    renderSignature("Trainer", evaluation.trainerSignature)}
                  {evaluation.teamMemberSignature &&
                    renderSignature(
                      "Team Member",
                      evaluation.teamMemberSignature
                    )}
                  {evaluation.supervisorSignature &&
                    renderSignature(
                      "Supervisor",
                      evaluation.supervisorSignature
                    )}
                </View>

                {/* Edit button (only if next week does not exist) */}
                {!nextWeekExists && fileData?.status !== "complete" && (
                  <SinglePressTouchable
                    onPress={() => handleEdit(week)}
                    className="mt-4 bg-[#1a237e] px-5 py-3 rounded-md self-start shadow-sm"
                  >
                    <Text className="text-white font-semibold text-sm">
                      Edit
                    </Text>
                  </SinglePressTouchable>
                )}
              </>
            )}

            {!isComplete && prevWeekComplete && (
              <SinglePressTouchable
                onPress={() => handleStart(week)}
                className="mt-2 bg-emerald-600 px-5 py-3 rounded-md self-start shadow-sm"
              >
                <Text className="text-white font-semibold text-sm">
                  Get Started
                </Text>
              </SinglePressTouchable>
            )}

            {!isComplete && !prevWeekComplete && (
              <Text className="text-sm text-gray-400 mt-1">
                Locked until previous week is complete
              </Text>
            )}
          </View>
        );
      })}

      {/* On Track to Qualify Summary */}
      <View className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 w-[90%] self-center">
        <Text className="text-base font-semibold mb-2">Summary</Text>
        <View className="flex-row flex-wrap">
          {/* Row 1 */}
          <View className="w-1/2 p-1">
            <Text className="text-sm text-gray-700">
              Total Hours on Job:{" "}
              <Text className="font-semibold text-gray-900">
                {totalHoursOnJob ?? 0}
              </Text>
            </Text>
          </View>

          <View className="w-1/2 p-1">
            <Text className="text-sm text-gray-700">
              Total Hours Off Job:{" "}
              <Text className="font-semibold text-gray-900">
                {totalHoursOffJob ?? 0}
              </Text>
            </Text>
          </View>

          {/* Row 2 */}
          <View className="w-1/2 p-1">
            <Text className="text-sm text-gray-700">
              Total Hours With Trainee:{" "}
              <Text className="font-semibold text-gray-900">
                {totalHoursWithTrainee ?? 0}
              </Text>
            </Text>
          </View>

          <View className="w-1/2 p-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-sm text-gray-700">
                On track to qualify?
              </Text>
              <Text className={onTrack ? "text-emerald-600" : "text-red-600"}>
                {onTrack ? "Yes" : "No"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Signature Preview Modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black bg-opacity-90 justify-center items-center"
          onPress={() => setSelectedImage(null)}
        >
          <View className="absolute top-10 right-5 z-50">
            <SinglePressTouchable onPress={() => setSelectedImage(null)}>
              <Text className="text-white text-2xl">✕</Text>
            </SinglePressTouchable>
          </View>
          <View className="bg-white p-4 rounded-lg w-[90%] h-[60%]">
            <Image
              source={{ uri: selectedImage! }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default EvaluationTimeline;
