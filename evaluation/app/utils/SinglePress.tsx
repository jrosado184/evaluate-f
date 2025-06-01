import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

let lastPress = 0;

const SinglePressTouchable: React.FC<TouchableOpacityProps> = ({
  onPress,
  ...props
}) => {
  const handlePress: TouchableOpacityProps["onPress"] = (event) => {
    const now = Date.now();
    if (now - lastPress < 300) return; // prevent double tap
    lastPress = now;
    onPress?.(event);
  };

  return <TouchableOpacity {...props} onPress={handlePress} />;
};

export default SinglePressTouchable;
