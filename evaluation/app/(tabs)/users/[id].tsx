import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
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
import EvaluationRow from "@/app/(tabs)/evaluations/EvaluationRow";
import { ActivityIndicator } from "react-native-paper";
import SinglePressTouchableTouchable from "@/app/utils/SinglePress";

const User = () => {
  const { id } = useGlobalSearchParams();
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();
  const { currentUser } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [evaluationFiles, setEvaluationFiles] = useState<any[]>([]);
  const openSwipeableRef = useRef<Swipeable | null>(null);

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
          createdBy: currentUser?.name,
        },
        { headers: { Authorization: token! } }
      );

      const newEvalId = res.data._id;
      router.push({
        pathname: `/evaluations/${newEvalId}/step1`,
        params: {
          id: id,
        },
      });
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

  const handleSwipeableWillOpen = (ref: Swipeable | null) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close?.();
    }

    // Store the currently opened swipeable
    openSwipeableRef.current = ref;
  };

  const handleTapOutside = () => {
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
        <View
          contentContainerStyle={{ paddingBottom: 80 }}
          onScrollBeginDrag={handleTapOutside}
          scrollEventThrottle={16}
        >
          <View style={{ padding: 24 }}>
            {/* Back */}
            <SinglePressTouchableTouchable
              onPress={() => router.replace("/users")}
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
            </SinglePressTouchableTouchable>

            {/* Employee card */}
            <UserCard
              name={employee?.employee_name}
              employee_id={employee?.employee_id}
              date_of_hire={formatISODate(employee?.date_of_hire)}
              locker_number={employee?.locker_number}
              knife_number={employee?.knife_number}
              position={employee?.position}
              department={employee?.department}
              last_update={formatISODate(employee?.last_updated)}
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
              <SinglePressTouchableTouchable
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
              </SinglePressTouchableTouchable>
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
              <View>
                {evaluationFiles.map((file) => (
                  <EvaluationRow
                    from={id?.toString()}
                    key={file._id}
                    file={file}
                    onDelete={handleDeleteEvaluation}
                    handleSwipeableWillOpen={(ref: Swipeable | null) =>
                      handleSwipeableWillOpen(ref)
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default User;
