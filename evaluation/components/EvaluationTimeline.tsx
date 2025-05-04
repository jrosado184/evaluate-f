import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  ScrollView,
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

  return (
    <View className="mt-2">
      {Array.from({ length: projectedTrainingWeeks }).map((_, i) => {
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
            <Text className="text-lg font-semibold mb-2">Week {week}</Text>

            {isComplete ? (
              <>
                <Text className="text-sm text-gray-700">
                  Total Hours on Job:{" "}
                  <Text className="font-semibold text-gray-900">
                    {evaluation.totalHoursOnJob ?? "0"}
                  </Text>
                </Text>

                <Text className="text-sm text-gray-700 mt-1">
                  Percent Qualified:{" "}
                  <Text className="font-semibold text-gray-900">
                    {evaluation.percentQualified ?? "-"}%
                  </Text>
                </Text>

                {evaluation.comments && (
                  <Text className="text-sm text-gray-500 mt-1">
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

                {/* Edit Button */}
                {!nextWeekComplete && (
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
            ) : isNext ? (
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

      {/* Signature Fullscreen Preview */}
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
