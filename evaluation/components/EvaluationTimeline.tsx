import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";

interface EvaluationTimelineProps {
  evaluations?: any[];
}

const EvaluationTimeline = ({ evaluations = [] }: EvaluationTimelineProps) => {
  const router = useRouter();
  const { id, fileId, folderId } = useLocalSearchParams();

  const completedWeeks = new Map(
    evaluations?.map((e) => [e.weekNumber, e]) || []
  );

  const nextAvailableWeek = (() => {
    for (let i = 1; i <= 6; i++) {
      if (!completedWeeks.has(i)) return i;
    }
    return null;
  })();

  const handleEdit = (weekNumber: number) => {
    router.push(
      `/users/${id}/folders/${folderId}/files/${fileId}/edit-form?step=2&week=${weekNumber}`
    );
  };

  const handleStart = (weekNumber: number) => {
    router.push(
      `/users/${id}/folders/${folderId}/files/${fileId}/edit-form?step=2&week=${weekNumber}`
    );
  };

  const handleGoBack = () => {
    router.push(`/users/${id}/folders/${folderId}`);
  };

  return (
    <View style={{ marginTop: 10 }}>
      {/* Week 1 to 6 */}
      {Array.from({ length: 6 }).map((_, i) => {
        const week = i + 1;
        const evaluation = completedWeeks.get(week);
        const isComplete = !!evaluation;
        const isNext = week === nextAvailableWeek;

        return (
          <View
            key={week}
            style={{
              marginBottom: 20,
              padding: 16,
              backgroundColor: "#f9fafb",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              Week {week}
            </Text>

            {isComplete ? (
              <>
                <Text style={{ fontSize: 14, color: "#374151" }}>
                  Total Hours on Job:{" "}
                  <Text style={{ fontWeight: "600", color: "#111827" }}>
                    {evaluation.totalHoursOnJob ?? "0"}
                  </Text>
                </Text>

                <Text style={{ fontSize: 14, color: "#374151", marginTop: 4 }}>
                  Percent Qualified:{" "}
                  <Text style={{ fontWeight: "600", color: "#111827" }}>
                    {evaluation.percentQualified ?? "-"}%
                  </Text>
                </Text>

                {evaluation.comments ? (
                  <Text
                    style={{ marginTop: 6, fontSize: 14, color: "#6b7280" }}
                  >
                    Comments:{" "}
                    <Text style={{ fontWeight: "500", color: "#374151" }}>
                      {evaluation.comments}
                    </Text>
                  </Text>
                ) : null}

                <TouchableOpacity
                  onPress={() => handleEdit(week)}
                  style={{
                    marginTop: 12,
                    backgroundColor: "#1a237e",
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
              </>
            ) : isNext ? (
              <TouchableOpacity
                onPress={() => handleStart(week)}
                style={{
                  marginTop: 8,
                  backgroundColor: "#059669", // darker green (emerald-600)
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Get Started
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: "#9ca3af", marginTop: 6 }}>
                Locked until previous week is complete
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default EvaluationTimeline;
