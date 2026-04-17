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

const getAssignedTrainers = (file: any) => {
  const raw =
    file?.assignedEditors ||
    file?.editors ||
    file?.assignedTrainers ||
    file?.trainers ||
    [];

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item };
      }

      return {
        id: item?._id || item?.id || item?.employee_id || item?.name,
        name: item?.name || item?.fullName || item?.trainerName || "",
      };
    })
    .filter((item) => item?.name);
};

const getInitials = (name?: string) => {
  if (!name || typeof name !== "string") return "";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const AvatarCircle = ({
  name,
  size = 32,
  overlap = 0,
  withWhiteBorder = false,
  zIndex,
}: {
  name: string;
  size?: number;
  overlap?: number;
  withWhiteBorder?: boolean;
  zIndex?: number;
}) => {
  const initials = getInitials(name);
  const safeName = name?.trim() ? name : initials || "TR";
  const { bg, text } = getAvatarMeta(safeName);

  return (
    <View
      className={`items-center justify-center rounded-full ${bg}`}
      style={{
        width: size,
        height: size,
        marginLeft: overlap,
        borderWidth: withWhiteBorder ? 2 : 1,
        borderColor: withWhiteBorder ? "#FFFFFF" : "#DDE3EA",
        zIndex,
      }}
    >
      <Text
        className={`font-bold ${text}`}
        style={{
          fontSize: 11,
          letterSpacing: 0.2,
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

const OverflowAvatar = ({
  count,
  overlap = 0,
  zIndex,
}: {
  count: number;
  overlap?: number;
  zIndex?: number;
}) => {
  return (
    <View
      className="items-center justify-center rounded-full bg-[#1A237E]"
      style={{
        width: 32,
        height: 32,
        marginLeft: overlap,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        zIndex,
      }}
    >
      <Text
        className="font-bold text-white"
        style={{
          fontSize: 10,
          letterSpacing: 0.2,
        }}
      >
        +{count}
      </Text>
    </View>
  );
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
  const assignedTrainers = useMemo(() => getAssignedTrainers(file), [file]);

  const assignedWithoutCreator = useMemo(() => {
    return assignedTrainers.filter((trainer) => {
      return (
        String(trainer?.name || "")
          .trim()
          .toLowerCase() !==
        String(trainerName || "")
          .trim()
          .toLowerCase()
      );
    });
  }, [assignedTrainers, trainerName]);

  const visibleAssigned = useMemo(
    () => assignedWithoutCreator.slice(0, 3),
    [assignedWithoutCreator],
  );
  const remainingAssigned = Math.max(assignedWithoutCreator.length - 3, 0);

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
            {trainerName ? (
              <View className="mr-3 flex-row items-center">
                <AvatarCircle
                  name={trainerName}
                  size={32}
                  overlap={0}
                  withWhiteBorder
                  zIndex={99}
                />

                {visibleAssigned.map((person, index) => (
                  <AvatarCircle
                    key={person.id || `${person.name}-${index}`}
                    name={person.name}
                    size={32.2}
                    overlap={-9}
                    withWhiteBorder
                    zIndex={98 - index}
                  />
                ))}

                {remainingAssigned > 0 ? (
                  <OverflowAvatar
                    count={remainingAssigned}
                    overlap={-9}
                    zIndex={94}
                  />
                ) : null}
              </View>
            ) : (
              <View className="mr-3" />
            )}

            <SimpleLineIcons name="arrow-right" size={14} color="#9CA3AF" />
          </View>
        </View>
      </SinglePressTouchable>
    </Swipeable>
  );
};

export default EvaluationRow;
