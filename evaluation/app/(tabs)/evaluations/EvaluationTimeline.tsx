// components/EvaluationTimeline.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import SinglePressTouchable from "@/app/utils/SinglePress";
import getServerIP from "@/app/requests/NetworkAddress";

type EvalWeek = {
  weekNumber: number;
  totalHoursOnJob?: number;
  totalHoursOffJob?: number;
  totalHoursWithTrainee?: number;
  percentQualified?: number | string;
  expectedQualified?: number;
  reTimeAchieved?: number | string | null;
  knifeSkillsAuditDate?: string;
  yieldAuditDate?: string;
  knifeScore?: number | string | null;
  handStretchCompleted?: boolean;
  hasPain?: boolean;
  comments?: string;
  trainerSignature?: string; // can be absolute or "/api/..."
  teamMemberSignature?: string; // same
  supervisorSignature?: string; // same
};

type Props = {
  fileData: {
    _id: string;
    status: "in_progress" | "complete" | string;
    personalInfo: { projectedTrainingHours: number | string };
    evaluations: EvalWeek[];
  };
};

const EvaluationTimeline = ({ fileData }: Props) => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [apiBase, setApiBase] = useState<string>("");

  useEffect(() => {
    (async () => setApiBase((await getServerIP()) || ""))();
  }, []);

  // Turn "/api/signatures/..." into "https://host/api/signatures/..."
  const toAbs = (u?: string) => {
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u; // already absolute
    if (!apiBase) return u; // will re-render once apiBase is loaded
    const origin = apiBase.replace(/\/api\/?$/, ""); // strip trailing /api
    return u.startsWith("/") ? `${origin}${u}` : `${origin}/${u}`;
  };

  const completedWeeks = new Map<number, EvalWeek>(
    (fileData.evaluations || []).map((e) => [e.weekNumber, e])
  );

  const projectedTrainingHours =
    Number(fileData.personalInfo.projectedTrainingHours) || 0;

  const projectedTrainingWeeks = projectedTrainingHours
    ? Math.ceil(projectedTrainingHours / 40)
    : 0;

  const handleEdit = (weekNumber: number) => {
    router.push({
      pathname: `/evaluations/[id]/step2`,
      params: { id: fileData?._id, week: String(weekNumber) },
    });
  };

  const handleStart = (weekNumber: number) => {
    router.push(`/evaluations/${fileData?._id}/step2?week=${weekNumber}`);
  };

  const renderSignature = (label: string, rawUri: string) => {
    const uri = toAbs(rawUri);
    if (!uri) return null;
    return (
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
  };

  // Totals across all saved weeks
  const totalHoursOnJob = fileData.evaluations?.reduce(
    (sum, e) => sum + (e.totalHoursOnJob || 0),
    0
  );
  const totalHoursOffJob = fileData.evaluations?.reduce(
    (sum, e) => sum + (e.totalHoursOffJob || 0),
    0
  );
  const totalHoursWithTrainee = fileData.evaluations?.reduce(
    (sum, e) => sum + (e.totalHoursWithTrainee || 0),
    0
  );

  const onTrack = useMemo(() => {
    if (projectedTrainingHours === 0 || completedWeeks.size === 0) return false;
    const lastWeekNumber = Math.max(...completedWeeks.keys());
    const currentEval = completedWeeks.get(lastWeekNumber);
    if (!currentEval) return false;

    const hours = Number(currentEval.totalHoursOnJob) || 0;

    const raw = currentEval.percentQualified;
    const actual =
      Number(typeof raw === "string" ? raw.replace("%", "") : raw ?? 0) || 0;

    if (hours === 0 || actual === 0) return false;
    const expected = (hours / projectedTrainingHours) * 100;
    return actual >= expected;
  }, [projectedTrainingHours, completedWeeks]);

  // how many cards to show
  const listLength = (() => {
    if (fileData.status === "complete") return fileData.evaluations.length;
    const hasRoom =
      Number(totalHoursOnJob) -
        (fileData?.evaluations?.[0]?.totalHoursOnJob || 0) <
      Number(projectedTrainingHours);
    return hasRoom
      ? fileData.evaluations.length + 1
      : Math.max(fileData.evaluations.length, projectedTrainingWeeks || 0);
  })();

  return (
    <View className="mt-2">
      {Array.from({ length: listLength }).map((_, i) => {
        const week = i + 1;
        const evaluation = completedWeeks.get(week);
        const prevWeekComplete = completedWeeks.has(week - 1) || week === 1;
        const isComplete = !!evaluation;
        const nextWeekExists = completedWeeks.has(week + 1);

        return (
          <View
            key={week}
            className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 w-[90%] self-center"
          >
            <Text className="text-lg font-semibold mb-3">Week {week}</Text>

            {isComplete && evaluation && (
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
                          ? `${evaluation.percentQualified}%`
                          : "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Expected Qualified:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.expectedQualified != null
                          ? `${evaluation.expectedQualified}%`
                          : "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      RE Time Achieved:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.reTimeAchieved ?? "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Knife Audit Date:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.knifeSkillsAuditDate || "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Yield Audit Date:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.yieldAuditDate || "-"}
                      </Text>
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-sm text-gray-700">
                      Knife Score:{" "}
                      <Text className="font-semibold text-gray-900">
                        {evaluation.knifeScore ?? "-"}
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
                    {evaluation.comments || "-"}
                  </Text>
                </Text>

                {/* Signatures */}
                <View className="mt-3 flex-row justify-between xs:gap-8 proMax:gap-4">
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

      {/* Summary */}
      <View className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 w-[90%] self-center">
        <Text className="text-base font-semibold mb-2">Summary</Text>
        <View className="flex-row flex-wrap">
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
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default EvaluationTimeline;
