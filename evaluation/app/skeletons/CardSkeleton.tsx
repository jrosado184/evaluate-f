import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";

const CardSkeleton = ({ amount, height, width }: any) => {
  return (
    <View className="gap-y-3">
      {Array.from({ length: amount }).map((_, index) => (
        <MotiView
          className={`bg-[#d5d4d4] rounded-lg flex-row ${height} ${width}`}
          key={index}
          from={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{
            type: "timing",
            duration: 500,
            loop: true,
          }}
        />
      ))}
    </View>
  );
};

export default CardSkeleton;
