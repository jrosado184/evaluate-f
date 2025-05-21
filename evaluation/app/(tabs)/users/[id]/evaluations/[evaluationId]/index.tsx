// app/(tabs)/users/[id]/evaluations/[evaluationId]/index.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import EvaluationTimeline from "@/components/EvaluationTimeline";
import Icon from "react-native-vector-icons/Feather";

const EvaluationSummary = () => {
  const { id: userId, evaluationId } = useLocalSearchParams();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvaluation = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      const res = await axios.get(`${baseUrl}/evaluations/${evaluationId}`, {
        headers: { Authorization: token! },
      });
      setEvaluation(res.data);
    } catch (err: any) {
      console.error("Failed to fetch evaluation:", err);
      Alert.alert("Error", "Could not load evaluation information.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEvaluation();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#1a237e" />
      </SafeAreaView>
    );
  }

  if (!evaluation) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>No evaluation found.</Text>
      </SafeAreaView>
    );
  }

  const weeksDone = evaluation.evaluations?.length || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Icon name="x" size={26} color="#1a237e" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "600" }}>
          Evaluation Summary
        </Text>
      </View>

      {/* If we have weeks, show timeline, otherwise placeholder */}
      {weeksDone > 0 ? (
        <EvaluationTimeline fileData={evaluation} />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Icon name="clipboard" size={50} color="#9ca3af" />
          <Text
            style={{ textAlign: "center", marginTop: 16, color: "#6b7280" }}
          >
            No evaluations recorded for this session.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default EvaluationSummary;
