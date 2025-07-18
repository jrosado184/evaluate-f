import React, { useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import SinglePressTouchable from "@/app/utils/SinglePress";

const EvaluationRow = ({
  file,
  onDelete,
  onPress,
  handleSwipeableWillOpen,
}: any) => {
  const swipeableRef = useRef<Swipeable>(null);
  const router = useRouter();

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 8],
      extrapolate: "clamp",
    });
    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          flexDirection: "row",
          height: "85%",
          marginRight: 5,
          width: "20%",
        }}
      >
        <SinglePressTouchable
          onPress={() => onDelete(file._id)}
          style={{
            width: 70,
            backgroundColor: "#EF4444",
            justifyContent: "center",
            alignItems: "center",
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Delete</Text>
        </SinglePressTouchable>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={0.8}
      overshootRight
      rightThreshold={10}
      onSwipeableWillOpen={() => handleSwipeableWillOpen(swipeableRef.current)}
      renderRightActions={renderRightActions}
      containerStyle={{ width: "100%" }}
    >
      <SinglePressTouchable
        onPress={() => onPress(file._id)}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderColor: "#E5E7EB",
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          backgroundColor: "#FFFFFF",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            {file.position}
          </Text>
          <Text style={{ color: "#9CA3AF", marginTop: 4 }}>
            Created: {formatISODate(file.uploadedAt)}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor:
              file.status === "complete"
                ? "#D1FAE5"
                : file.status === "in_progress"
                ? "#FEF9C3"
                : "#FEE2E2",
            color:
              file.status === "complete"
                ? "#065F46"
                : file.status === "in_progress"
                ? "#92400E"
                : "#991B1B",
          }}
        >
          {file.status.replace("_", " ")}
        </Text>
      </SinglePressTouchable>
    </Swipeable>
  );
};

export default EvaluationRow;
