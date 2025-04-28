import React from "react";
import { View, Text, FlatList } from "react-native";

interface Evaluation {
  weekNumber: number;
  totalHours: number;
  percentQualified: string;
  comments: string;
  createdAt: string;
}

const EvaluationTimeline = ({ evaluations }: { evaluations: Evaluation[] }) => {
  return (
    <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
      {evaluations.length === 0 ? (
        <Text
          style={{
            color: "#6b7280",
            fontSize: 16,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          No evaluations yet.
        </Text>
      ) : (
        <FlatList
          data={evaluations.sort((a, b) => a.weekNumber - b.weekNumber)} // Sort by week number
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 24 }}>
              {/* Week Title */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#1a237e",
                  marginBottom: 4,
                }}
              >
                Week {item.weekNumber}
              </Text>

              {/* Summary Info */}
              <View
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: 16,
                  borderRadius: 10,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{ fontSize: 16, color: "#374151", marginBottom: 6 }}
                >
                  Total Hours:{" "}
                  <Text style={{ fontWeight: "600", color: "#111827" }}>
                    {item.totalHours}
                  </Text>
                </Text>
                <Text
                  style={{ fontSize: 16, color: "#374151", marginBottom: 6 }}
                >
                  Percent Qualified:{" "}
                  <Text style={{ fontWeight: "600", color: "#111827" }}>
                    {item.percentQualified}%
                  </Text>
                </Text>
                {item.comments ? (
                  <Text
                    style={{ fontSize: 15, color: "#6b7280", marginTop: 8 }}
                  >
                    "{item.comments}"
                  </Text>
                ) : null}
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    marginTop: 10,
                    textAlign: "right",
                  }}
                >
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default EvaluationTimeline;
