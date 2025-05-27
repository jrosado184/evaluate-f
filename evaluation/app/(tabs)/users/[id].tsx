import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useGlobalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import { Swipeable } from "react-native-gesture-handler";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import UserCard from "@/components/UserCard";
import useEmployeeContext from "@/app/context/EmployeeContext";
import useAuthContext from "@/app/context/AuthContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import EvaluationRow from "@/components/evaluations/EvaluationRow";

const User = () => {
  const { id } = useGlobalSearchParams(); // employeeId
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();
  const { currentUser } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [evaluationFiles, setEvaluationFiles] = useState<any[]>([]);
  const openSwipeableRef = useRef<Swipeable | null>(null);
  const isNavigatingRef = useRef(false);

  // Fetch employee + evals
  const fetchEmployee = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      const empRes = await axios.get(`${baseUrl}/employees/${id}`, {
        headers: { Authorization: token! },
      });
      setEmployee(empRes.data);
      setAddEmployeeInfo(empRes.data);

      const evalRes = await axios.get(
        `${baseUrl}/employees/${id}/evaluations`,
        { headers: { Authorization: token! } }
      );
      setEvaluationFiles(evalRes.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not load employee or evaluations.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEmployee();
    }, [])
  );

  function randomHex24() {
    return Array.from({ length: 24 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
  }

  /** Navigate into step1 or summary—but only once per tap **/
  const handleEvaluationPress = async (evaluationId: string) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      const { data: evalDoc } = await axios.get(
        `${baseUrl}/evaluations/${evaluationId}`,
        { headers: { Authorization: token! } }
      );

      const info = evalDoc.personalInfo || {};
      const hasInfo =
        !!info.teamMemberName && !!info.position && !!info.department;

      if (!hasInfo || evalDoc.status === "uploaded") {
        router.push(`/users/${id}/evaluations/${evaluationId}/step1`);
      } else {
        router.push(`/users/${id}/evaluations/${evaluationId}`);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not load evaluation details.");
    } finally {
      // re-enable after a short pause
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500);
    }
  };

  /** Always go to step1 when creating **/
  const handleStartEvaluation = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      // create on backend
      const res = await axios.post(
        `${baseUrl}/employees/${id}/evaluations`,
        {
          position: "Untitled",
          createdBy: currentUser,
        },
        { headers: { Authorization: token! } }
      );

      const newEvalId = res.data._id;
      router.push(`/users/${id}/evaluations/${newEvalId}/step1`);
    } catch (err) {
      console.error("Failed to start evaluation:", err);
      Alert.alert("Error", "Could not start evaluation.");
    }
  };

  /** Swipe-to-delete **/
  const handleDeleteEvaluation = (evaluationId: string) => {
    Alert.alert(
      "Delete Evaluation",
      "Are you sure you want to delete this evaluation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const baseUrl = await getServerIP();
              await axios.delete(
                `${baseUrl}/employees/${id}/evaluations/${evaluationId}`,
                { headers: { Authorization: token! } }
              );
              fetchEmployee();
            } catch {
              Alert.alert("Error", "Failed to delete evaluation.");
            }
          },
        },
      ]
    );
  };

  /** Only one row open at once **/
  /** Only one row open at once **/
  const handleSwipeableWillOpen = (ref: Swipeable | null) => {
    // If there’s an open swipeable and it’s not the same as the newly opened one
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close?.();
    }

    // Store the currently opened swipeable
    openSwipeableRef.current = ref;
  };

  const handleTapOutside = () => {
    // Close and clear reference if a swipeable is open
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close?.();
      openSwipeableRef.current = null;
    }
  };

  // Full-screen loader
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color="#1a237e" />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleTapOutside}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          onScrollBeginDrag={handleTapOutside}
          scrollEventThrottle={16}
        >
          <View style={{ padding: 24 }}>
            {/* Back */}
            <TouchableOpacity
              onPress={() => router.push("/users")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Icon name="chevron-left" size={28} />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 20,
                  fontWeight: "600",
                }}
              >
                Back
              </Text>
            </TouchableOpacity>

            {/* Employee card */}
            <UserCard
              name={employee?.employee_name}
              employee_id={employee?.employee_id}
              locker_number={employee?.locker_number}
              knife_number={employee?.knife_number}
              position={employee?.position}
              department={employee?.department}
              last_update={formatISODate(employee?.last_updated)}
              status="Damaged"
            />

            {/* Header + Create */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 24,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "600" }}>
                Evaluations
              </Text>
              <TouchableOpacity
                onPress={handleStartEvaluation}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: "#2563EB",
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Icon name="plus" size={12} color="#2563EB" />
                <Text style={{ color: "#2563EB", marginLeft: 4 }}>Create</Text>
              </TouchableOpacity>
            </View>

            {/* Empty state */}
            {evaluationFiles.length === 0 ? (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 48,
                }}
              >
                <Icon name="clipboard" size={50} color="#9CA3AF" />
                <Text style={{ color: "#6B7280", marginTop: 16 }}>
                  No evaluations yet.
                </Text>
              </View>
            ) : (
              evaluationFiles.map((file) => (
                <EvaluationRow
                  key={file._id}
                  file={file}
                  onDelete={handleDeleteEvaluation}
                  onPress={handleEvaluationPress}
                  handleSwipeableWillOpen={(ref: Swipeable | null) =>
                    handleSwipeableWillOpen(ref)
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default User;
