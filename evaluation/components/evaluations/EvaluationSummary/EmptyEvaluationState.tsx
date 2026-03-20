// @ts-nocheck
import React from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { EmptyEvaluationsStateProps } from "./types";

export default function EmptyEvaluationsState({
  onStart,
  submitting,
}: EmptyEvaluationsStateProps) {
  return (
    <View className="items-center justify-center px-8 py-14">
      <View className="mb-4 h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-gray-100">
        <Icon name="clipboard" size={50} color="#9CA3AF" />
      </View>

      <Text className="mb-1.5 text-base font-bold text-gray-700">
        No evaluations yet
      </Text>
      <Text className="mb-5 text-center text-sm leading-5 text-gray-400">
        Tap below to start the first week.
      </Text>

      <SinglePressTouchable
        onPress={onStart}
        disabled={submitting}
        className="h-12 items-center justify-center rounded-xl bg-[#1a237e] px-7"
      >
        <Text className="text-[15px] font-semibold text-white">
          Start Evaluation
        </Text>
      </SinglePressTouchable>
    </View>
  );
}
