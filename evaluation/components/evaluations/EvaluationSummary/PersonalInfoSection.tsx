// @ts-nocheck
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Dot from "react-native-vector-icons/Entypo";
import SinglePressTouchable from "@/app/utils/SinglePress";
import useAuthContext from "@/app/context/AuthContext";
import { getAvatarMeta } from "@/app/helpers/avatar";

import { InfoRow } from "./SummaryPrimitives";
import { PersonalInfoSectionProps } from "./types";

const getInitials = (name?: string) => {
  if (!name || typeof name !== "string") return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
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

const getAssignedEditors = (evaluation: any) => {
  const raw =
    evaluation?.assignedEditors ||
    evaluation?.editors ||
    evaluation?.assignedTrainers ||
    evaluation?.trainers ||
    [];

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { name: item, id: item };
      }

      return {
        id: item?._id || item?.id || item?.employee_id || item?.name,
        name: item?.name || item?.fullName || item?.trainerName || "",
      };
    })
    .filter((item) => item?.name);
};

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
  const initials = getInitials(name);

  return (
    <View
      className={`items-center justify-center rounded-full border ${subtle ? "bg-[#F8FAFC]" : bg}`}
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

export default function PersonalInfoSection({
  rows,
  evaluation,
  evaluationId,
  onEdit,
  onNavigateAfterClose,
  onManageTrainers,
}: PersonalInfoSectionProps & {
  onManageTrainers?: () => void;
}) {
  const { currentUser } = useAuthContext();

  const creatorName = useMemo(() => getCreatorName(evaluation), [evaluation]);
  const assignedEditors = useMemo(
    () => getAssignedEditors(evaluation),
    [evaluation],
  );

  const currentUserName = currentUser?.name || "";
  const createdByCurrentUser =
    creatorName &&
    currentUserName &&
    creatorName.trim().toLowerCase() === currentUserName.trim().toLowerCase();

  const canManageTrainers =
    createdByCurrentUser && evaluation?.status !== "complete";

  return (
    <View className="px-4 pt-6 pb-1">
      <View className="mb-3 flex-row items-center justify-between px-0.5">
        <Text className="text-[17px] font-bold tracking-[-0.3px] text-gray-900">
          Personal Information
        </Text>

        {evaluation?.status !== "complete" ? (
          <SinglePressTouchable
            onPress={() => {
              if (onEdit) onEdit();
              else
                onNavigateAfterClose(`/evaluations/${evaluationId}/edit/step1`);
            }}
            className="flex-row items-center rounded-lg bg-blue-50 px-3 py-1.5"
          >
            <Icon
              name="edit-2"
              size={12}
              color="#2563EB"
              style={{ marginRight: 4 }}
            />
            <Text className="text-[13px] font-semibold text-blue-600">
              Edit
            </Text>
          </SinglePressTouchable>
        ) : (
          <View className="flex-row items-center rounded-full bg-emerald-50 px-4 py-1">
            <Dot name="dot-single" size={20} color="green" />
            <Text className="font-bold text-emerald-700">Qualified</Text>
          </View>
        )}
      </View>

      {/* Managed by / trainer access */}
      <View
        className="mb-3 rounded-2xl bg-white px-4 py-3"
        style={{
          borderWidth: 1,
          borderColor: "#E3E8EF",
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[12px] font-medium uppercase tracking-[1px] text-neutral-400">
              Managed by
            </Text>

            <View className="mt-2 flex-row items-center">
              {creatorName ? (
                <>
                  <AvatarChip name={creatorName} size={32} />
                  <View className="ml-2">
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
                <Icon name="user-plus" size={14} color="#2563EB" />
                <Text className="ml-1.5 text-[12px] font-semibold text-[#2563EB]">
                  Add Trainer
                </Text>
              </View>
            </SinglePressTouchable>
          ) : null}
        </View>

        {assignedEditors.length > 0 ? (
          <View className="mt-3 border-t border-[#EEF2F6] pt-3">
            <Text className="mb-2 text-[12px] font-medium text-neutral-500">
              Additional editors
            </Text>

            <View className="flex-row flex-wrap items-center">
              {assignedEditors.map((person, index) => (
                <View
                  key={person.id || `${person.name}-${index}`}
                  className="mb-2 mr-2 flex-row items-center rounded-full bg-[#F8FAFC] px-2 py-1.5"
                  style={{
                    borderWidth: 1,
                    borderColor: "#E3E8EF",
                  }}
                >
                  <AvatarChip name={person.name} size={26} subtle />
                  <Text className="ml-2 text-[12px] font-medium text-[#334155]">
                    {person.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View className="overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white px-4">
        {rows.map((r, i) => (
          <InfoRow
            key={r.label}
            label={r.label}
            value={r.value}
            isLast={i === rows.length - 1}
          />
        ))}
      </View>
    </View>
  );
}
