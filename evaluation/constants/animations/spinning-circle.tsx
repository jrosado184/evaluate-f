import { ActivityIndicator, StyleSheet } from "react-native";
import React from "react";
const SpinningCircle = ({ color }: any) => {
  return (
    <ActivityIndicator
      style={{
        height: 10,
      }}
      size="small"
      color={color}
    />
  );
};

export default SpinningCircle;
