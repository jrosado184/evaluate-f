import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  step: number;
}

const StepProgressBar = ({ step }: Props) => {
  const stepsTotal = 4;
  const progress = (step / stepsTotal) * 100;

  return (
    <View className="bg-white">
      <View className="px-6 py-4">
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          Step {step} of {stepsTotal}
        </Text>
        <View
          className="my-4"
          style={{
            height: 8,
            backgroundColor: "#e5e7eb",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#1a237e",
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default StepProgressBar;
