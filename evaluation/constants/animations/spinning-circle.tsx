import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const SpinningCircle = () => {
  return (
    <ActivityIndicator
      style={{
        height: 10,
      }}
      size="small"
      color="#0000ff"
    />
  );
};

export default SpinningCircle;
