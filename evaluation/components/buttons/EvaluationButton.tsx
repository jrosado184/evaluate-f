import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import SpinningCircle from "@/constants/animations/spinning-circle";

interface EvaluationButtonProps {
  status: "incomplete" | "in_progress" | "complete";
  canQualify: boolean;
  onPress?: () => void;
  isLoading?: boolean;
  styles?: string; // external container (like mt-6)
  inputStyles?: string; // inner button styles override
}

const EvaluationButton: React.FC<EvaluationButtonProps> = ({
  status,
  canQualify,
  onPress,
  isLoading = false,
  styles = "",
  inputStyles = "",
}) => {
  const bgColor =
    status === "incomplete"
      ? "bg-[#1a237e]"
      : canQualify
      ? "bg-[#059669]"
      : "bg-gray-300";

  const disabled = isLoading || (status !== "incomplete" && !canQualify);

  const label = status === "incomplete" ? "Start Evaluation" : "Qualify";

  return (
    <View className={`justify-center items-center w-[100%] ${styles}`}>
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        activeOpacity={disabled ? 1 : 0.85}
        disabled={disabled}
        className={`h-16 w-full rounded-[0.625rem] items-center justify-center ${bgColor} ${inputStyles} ${
          isLoading ? "opacity-60" : ""
        }`}
      >
        {isLoading ? (
          <SpinningCircle color="white" />
        ) : (
          <Text className="font-inter-medium text-white text-[1rem]">
            {label}
          </Text>
        )}
      </TouchableOpacity>

      {!canQualify && status !== "incomplete" && !isLoading && (
        <Text className="text-xs mt-2 text-white opacity-70">
          At least 3 weeks required
        </Text>
      )}
    </View>
  );
};

export default EvaluationButton;
