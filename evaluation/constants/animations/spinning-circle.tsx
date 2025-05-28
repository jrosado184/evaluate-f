import { StyleSheet } from "react-native";
import React from "react";
import { ActivityIndicator } from "react-native-paper";
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
