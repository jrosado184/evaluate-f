// EvaluationTimeline.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const EvaluationTimeline = ({ fileData }: any) => {
  const router = useRouter();
  const { id, fileId, folderId } = useLocalSearchParams();
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
      `/users/${id}/folders/${folderId}/files/${fileId}/edit-form?step=2&week=${weekNumber}`
    );
  };

  const handleStart = (weekNumber: number) => {
    router.push(
      `/users/${id}/folders/${folderId}/files/${fileId}/edit-form?step=2&week=${weekNumber}`
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
            className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200"
          >
            <Text className="text-lg font-semibold mb-3">Week {week}</Text>

            {isComplete ? (
              <>
                <View className="flex-row flex-wrap gap-y-1">
                  {/* Time & Qualification */}
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

                  {/* Audits */}
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

                  {/* Physical Wellness */}
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

                {/* Signature Previews */}
                <View className="mt-3 flex-row justify-between gap-2">
                  {[
                    { label: "Trainer", key: "trainerSignature" },
                    {
                      label: "Trainee",
                      key: evaluation.traineeSignature
                        ? "traineeSignature"
                        : "teamMemberSignature",
                    },
                    { label: "Supervisor", key: "supervisorSignature" },
                  ].map(
                    (sig) =>
                      evaluation[sig.key] && (
                        <Pressable
                          key={sig.key}
                          onPress={() => setSelectedImage(evaluation[sig.key])}
                          className="flex-1 items-center"
                        >
                          <View className="w-32 h-16 bg-neutral-50 border border-neutral-400 rounded-md overflow-hidden">
                            <Image
                              source={{ uri: evaluation[sig.key] }}
                              className="w-full h-full"
                              resizeMode="contain"
                            />
                          </View>
                          <Text className="text-xs text-gray-400 mt-1">
                            {sig.label}
                          </Text>
                        </Pressable>
                      )
                  )}
                </View>

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

      {/* Final Totals + Final Signatures */}
      {fileData?.evaluations?.length > 0 && (
        <View className="mt-6 p-4 bg-white border border-gray-300 rounded-xl">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Totals
          </Text>
          <View className="flex-row flex-wrap gap-y-1">
            <View className="w-1/2 pr-2">
              <Text className="text-sm text-gray-700">
                Total Hours on Job:{" "}
                <Text className="font-semibold text-gray-900">
                  {totalOnJob}
                </Text>
              </Text>
            </View>
            <View className="w-1/2 pr-2">
              <Text className="text-sm text-gray-700">
                Total Hours Off Job:{" "}
                <Text className="font-semibold text-gray-900">
                  {totalOffJob}
                </Text>
              </Text>
            </View>
            <View className="w-1/2 pr-2">
              <Text className="text-sm text-gray-700">
                Total Hours With Trainee:{" "}
                <Text className="font-semibold text-gray-900">
                  {totalWithTrainee}
                </Text>
              </Text>
            </View>
            <View className="w-1/2 pr-2">
              <Text className="text-sm text-gray-700">
                Total:{" "}
                <Text className="font-semibold text-gray-900">
                  {totalOnJob + totalOffJob}
                </Text>
              </Text>
            </View>
          </View>

          {/* Final Signature Preview */}
          {fileData.finalSignatures && (
            <>
              <Text className="text-md font-semibold text-gray-900 mt-6 mb-2">
                Final Signatures
              </Text>
              <View className="flex-row flex-wrap justify-start gap-4">
                {[
                  { label: "Team Member", key: "teamMember" },
                  { label: "Trainer", key: "trainer" },
                  { label: "Supervisor", key: "supervisor" },
                  { label: "Training Supervisor", key: "trainingSupervisor" },
                ].map(
                  ({ label, key }) =>
                    fileData.finalSignatures[key] && (
                      <Pressable
                        key={key}
                        onPress={() =>
                          setSelectedImage(fileData.finalSignatures[key])
                        }
                        className="items-center"
                      >
                        <View className="w-32 h-16 bg-neutral-50 border border-neutral-400 rounded-md overflow-hidden">
                          <Image
                            source={{ uri: fileData.finalSignatures[key] }}
                            className="w-full h-full"
                            resizeMode="contain"
                          />
                        </View>
                        <Text className="text-xs text-gray-400 mt-1">
                          {label}
                        </Text>
                      </Pressable>
                    )
                )}
              </View>
            </>
          )}
        </View>
      )}

      {/* Fullscreen Signature Modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black bg-opacity-90 justify-center items-center"
          onPress={() => setSelectedImage(null)}
        >
          <View className="absolute top-10 right-5 z-50">
            <TouchableOpacity onPress={() => setSelectedImage(null)}>
              <Text className="text-white text-2xl">✕</Text>
            </TouchableOpacity>
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
