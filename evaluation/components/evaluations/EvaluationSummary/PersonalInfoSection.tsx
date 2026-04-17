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
import EvaluationCreator from "../EvaluationCreator";
import { canEditEvaluation } from "@/app/config/permissions";

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

  return (
    <View className="px-4 pt-6 pb-1">
      <View className="mb-3 flex-row items-center justify-between px-0.5">
        <Text className="text-[17px] font-bold tracking-[-0.3px] text-gray-900">
          Personal Information
        </Text>

        {evaluation?.status !== "complete" ? (
          canEditEvaluation(evaluation, currentUser) && (
            <SinglePressTouchable
              onPress={() => {
                if (onEdit) onEdit();
                else
                  onNavigateAfterClose?.(
                    `/evaluations/${evaluationId}/edit/step1`,
                  );
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
          )
        ) : (
          <View className="flex-row items-center rounded-full bg-emerald-50 px-4 py-1">
            <Dot name="dot-single" size={20} color="green" />
            <Text className="font-bold text-emerald-700">Qualified</Text>
          </View>
        )}
      </View>

      <EvaluationCreator
        evaluation={evaluation}
        currentUser={currentUser}
        onManageTrainers={onManageTrainers}
      />

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
