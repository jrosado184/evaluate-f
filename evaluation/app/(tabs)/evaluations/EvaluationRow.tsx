import React, { useMemo, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { getAvatarMeta } from "@/app/helpers/avatar";

type Props = {
  file: any;
  includeName?: boolean;
  onPress: (evaluationId: string) => void;
  onDelete?: (id: string) => void;
  handleSwipeableWillOpen?: (ref: Swipeable | null) => void;
};

const getStatusConfig = (status?: string) => {
  if (status === "complete") {
    return {
      label: "Completed",
      pill: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    };
  }

  if (status === "in_progress" || status === "incomplete") {
    return {
      label: "In Progress",
      pill: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    };
  }

  return {
    label: status?.replace(/_/g, " ") || "Unknown",
    pill: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-400",
  };
};

const getTrainerName = (file: any) => {
  const raw =
    file?.createdByName ||
    file?.createdBy ||
    file?.trainerName ||
    file?.startedBy ||
    file?.trainer?.name ||
    file?.createdByUser?.name ||
    "";

  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  if (raw && typeof raw === "object") {
    return raw?.name || raw?.fullName || raw?.label || "";
  }

  return "";
};

const getInitials = (name?: string) => {
  if (!name || typeof name !== "string") return "";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const EvaluationRow = ({
  file,
  onDelete,
  handleSwipeableWillOpen,
  includeName,
  onPress,
}: Props) => {
  const swipeableRef = useRef<Swipeable>(null);

  const status = getStatusConfig(file?.status);
  const createdAt = file?.uploadedAt ? formatISODate(file.uploadedAt) : "—";
  const position = file?.position || "Evaluation";
  const teamMemberName = file?.personalInfo?.teamMemberName || "";

  const trainerName = useMemo(() => getTrainerName(file), [file]);
  const trainerInitials = useMemo(
    () => getInitials(trainerName),
    [trainerName],
  );

  const safeAvatarName =
    typeof trainerName === "string" && trainerName.trim().length > 0
      ? trainerName
      : trainerInitials || "TR";

  const { bg, text } = useMemo(
    () => getAvatarMeta(safeAvatarName),
    [safeAvatarName],
  );

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    if (!onDelete) return null;

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [90, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          justifyContent: "center",
          marginBottom: 14,
          marginLeft: 8,
        }}
      >
        <SinglePressTouchable
          onPress={() => onDelete(file._id)}
          activeOpacity={0.85}
          className="min-w-[84px] items-center justify-center rounded-[20px] bg-red-500 px-4"
          style={{ height: "100%" }}
        >
          <Text className="text-[13px] font-bold text-white">Delete</Text>
        </SinglePressTouchable>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={handleSwipeableWillOpen ? 0.9 : 1}
      overshootRight={!!handleSwipeableWillOpen}
      rightThreshold={handleSwipeableWillOpen ? 18 : 0}
      onSwipeableWillOpen={() =>
        handleSwipeableWillOpen?.(swipeableRef.current)
      }
      renderRightActions={renderRightActions}
      containerStyle={{ width: "100%" }}
    >
      <SinglePressTouchable
        onPress={() => onPress(file._id)}
        activeOpacity={0.82}
        className="mb-3.5 w-full rounded-[22px] border border-gray-200 bg-white px-4 py-4"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              numberOfLines={1}
              className="text-[17px] font-bold text-gray-900"
            >
              {position}
            </Text>

            {includeName && !!teamMemberName && (
              <Text
                numberOfLines={1}
                className="mt-1 text-[13px] font-medium text-gray-500"
              >
                {teamMemberName}
              </Text>
            )}
          </View>

          <View
            className={`flex-row items-center rounded-full px-2.5 py-1 ${status.pill}`}
          >
            <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status.dot}`} />
            <Text className={`text-[11px] font-semibold ${status.text}`}>
              {status.label}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[13px] text-gray-400">
              Created:{" "}
              <Text className="font-semibold text-gray-500">{createdAt}</Text>
            </Text>
          </View>

          <View className="flex-row items-center">
            {trainerInitials ? (
              <View
                className={`mr-3 h-8 w-8 items-center justify-center rounded-full border border-[#DDE3EA] ${bg}`}
              >
                <Text className={`text-[11px] font-bold ${text}`}>
                  {trainerInitials}
                </Text>
              </View>
            ) : null}

            <SimpleLineIcons name="arrow-right" size={14} color="#9CA3AF" />
          </View>
        </View>
      </SinglePressTouchable>
    </Swipeable>
  );
};

export default EvaluationRow;
