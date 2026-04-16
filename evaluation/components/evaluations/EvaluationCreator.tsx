import { View, Text } from "react-native";
import React, { useMemo } from "react";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { getAvatarMeta } from "@/app/helpers/avatar";
import Icon from "react-native-vector-icons/Feather";

const EvaluationCreator = ({
  evaluation,
  currentUser,
  onManageTrainers,
}: any) => {
  const getAssignedEditors = (evaluation: any) => {
    if (!Array.isArray(evaluation?.assignedTrainers)) return [];

    return evaluation?.assignedTrainers
      .map((item: any) => {
        if (typeof item === "string") {
          return { name: item, id: item };
        }

        return {
          id: item?._id || item?.id || item?.employee_id || item?.name,
          name: item?.name || item?.fullName || item?.trainerName || "",
        };
      })
      .filter((item: any) => item?.name);
  };

  const assignedEditors = useMemo(
    () => getAssignedEditors(evaluation),
    [evaluation],
  );

  const trainerButtonLabel =
    assignedEditors.length > 0 ? "Edit Trainers" : "Assign Trainers";

  const AssignedTrainerPill = ({
    name,
    index,
  }: {
    name: string;
    index: number;
  }) => {
    return (
      <View
        key={`${name}-${index}`}
        className="mb-2 mr-2 flex-row items-center bg-[#F8FAFC] px-2.5 py-1.5"
        style={{}}
      >
        <AvatarChip name={name} size={26} subtle />
        <Text className="ml-2 text-[12px] font-medium text-[#334155]">
          {name}
        </Text>
      </View>
    );
  };

  const getCreatorName = (evaluation: any) => {
    return (
      evaluation?.createdBy ||
      evaluation?.createdByName ||
      evaluation?.creatorName ||
      evaluation?.trainerName ||
      evaluation?.createdByUser?.name ||
      ""
    );
  };

  const creatorName = useMemo(() => getCreatorName(evaluation), [evaluation]);

  const AvatarChip = ({
    name,
    size = 32,
    subtle = false,
  }: {
    name?: string;
    size?: number;
    subtle?: boolean;
  }) => {
    const { bg, text } = getAvatarMeta(name || "");
    const getInitials = (name?: string) => {
      if (!name || typeof name !== "string") return "";
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length === 0) return "";
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    };
    const initials = getInitials(name);

    return (
      <View
        className={`items-center justify-center rounded-full border ${bg}`}
        style={{
          width: size,
          height: size,
          borderColor: "#DDE3EA",
        }}
      >
        <Text
          className={`font-bold ${subtle ? "text-[#475569]" : text}`}
          style={{
            fontSize: size <= 28 ? 10 : 11,
            letterSpacing: 0.3,
          }}
        >
          {initials}
        </Text>
      </View>
    );
  };

  const currentUserName = currentUser?.name || "";
  const createdByCurrentUser =
    creatorName &&
    currentUserName &&
    creatorName.trim().toLowerCase() === currentUserName.trim().toLowerCase();

  const canManageTrainers =
    createdByCurrentUser && evaluation?.status !== "complete";

  return (
    <View
      className="mb-3 rounded-2xl bg-white px-4 py-3"
      style={{
        borderWidth: 1,
        borderColor: "#E3E8EF",
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[12px] font-medium uppercase tracking-[1px] text-neutral-400">
            Managed by
          </Text>

          <View className="mt-2 flex-row items-center">
            {creatorName ? (
              <>
                <AvatarChip name={creatorName} size={34} />
                <View className="ml-2.5 flex-1">
                  <Text className="text-[14px] font-semibold text-[#111827]">
                    {creatorName}
                  </Text>
                  <Text className="text-[12px] text-neutral-500">
                    Evaluation creator
                  </Text>
                </View>
              </>
            ) : (
              <Text className="text-[13px] text-neutral-500">
                No creator assigned
              </Text>
            )}
          </View>
        </View>

        {canManageTrainers ? (
          <SinglePressTouchable
            onPress={onManageTrainers}
            className="rounded-full bg-[#F5F9FF] px-3 py-2"
            style={{
              borderWidth: 1,
              borderColor: "#D7E6FF",
            }}
          >
            <View className="flex-row items-center">
              <Icon name="users" size={14} color="#2563EB" />
              <Text className="ml-1.5 text-[12px] font-semibold text-[#2563EB]">
                {trainerButtonLabel}
              </Text>
            </View>
          </SinglePressTouchable>
        ) : null}
      </View>

      <View className="mt-3 border-t border-[#EEF2F6] pt-3">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-[12px] font-medium text-neutral-500">
            Assigned Trainers
          </Text>

          {assignedEditors.length > 0 ? (
            <View className="rounded-full bg-[#F8FAFC] px-2 py-1">
              <Text className="text-[11px] font-semibold text-[#475569]">
                {assignedEditors.length}{" "}
                {assignedEditors.length === 1 ? "trainer" : "trainers"}
              </Text>
            </View>
          ) : null}
        </View>

        {assignedEditors.length > 0 ? (
          <View className="flex-row flex-wrap items-center">
            {assignedEditors.map((person: any, index: number) => (
              <AssignedTrainerPill
                key={person.id || `${person.name}-${index}`}
                name={person.name}
                index={index}
              />
            ))}
          </View>
        ) : (
          <View
            className="rounded-2xl bg-[#FAFBFC] px-3 py-3"
            style={{
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "#E2E8F0",
            }}
          >
            <Text className="text-[12px] leading-5 text-[#64748B]">
              No trainers assigned yet. Assigned trainers can edit weekly
              progress, comments, and signatures.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default EvaluationCreator;
