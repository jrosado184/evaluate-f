import { View, Text } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SinglePressTouchable from "@/app/utils/SinglePress";

const WorkHardening = () => {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Work Hardening</Text>

        <SinglePressTouchable
          //   onPress={handleStartEvaluation}
          style={styles.createButton}
        >
          <Icon name="plus" size={12} color="#2563EB" />
          <Text style={styles.createButtonText}>Create</Text>
        </SinglePressTouchable>
      </View>

      {/* {evaluationFiles.length === 0 ? ( */}
      <View style={styles.emptyState}>
        <Icon name="clipboard" size={50} color="#9CA3AF" />
        <Text style={styles.emptyStateText}>No files yet.</Text>
      </View>
      {/* ) : ( */}
      <View style={styles.evaluationsList}>
        {/* {evaluationFiles.map((file) => (
            <EvaluationRow
              key={file._id}
              file={file}
              onPress={() => openSheet(file._id)}
              onDelete={handleDeleteEvaluation}
              handleSwipeableWillOpen={(ref: Swipeable | null) =>
                handleSwipeableWillOpen(ref)
              }
            />
          ))} */}
      </View>
      {/* )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    marginLeft: 4,
    fontSize: 20,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#2563EB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  createButtonText: {
    color: "#2563EB",
    marginLeft: 4,
  },
  evaluationsList: {
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 48,
  },
  emptyStateText: {
    color: "#6B7280",
    marginTop: 16,
  },
});

export default WorkHardening;
