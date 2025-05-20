import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useGlobalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import { Swipeable } from "react-native-gesture-handler";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import UserCard from "@/components/UserCard";
import CardSkeleton from "@/app/skeletons/CardSkeleton";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import useAuthContext from "@/app/context/AuthContext";

const User = () => {
  const { id } = useGlobalSearchParams();
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();
  const { currentUser } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [evaluationFiles, setEvaluationFiles] = useState<any[]>([]);
  const openSwipeableRef = useRef<Swipeable | null>(null);

  const fetchEmployee = async () => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();

    const res = await axios.get(`${baseUrl}/employees/${id}`, {
      headers: { Authorization: token },
    });
    setEmployee(res.data);
    setAddEmployeeInfo(res.data);
    setLoading(false);

    const evalRes = await axios.get(`${baseUrl}/employees/${id}/evaluations`, {
      headers: { Authorization: token },
    });
    setEvaluationFiles(evalRes.data);
  };

  const handleStartEvaluation = () => {
    router.push(`/users/${id}/evaluations/step1`);
  };

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
            const token = await AsyncStorage.getItem("token");
            const baseUrl = await getServerIP();
            try {
              await axios.delete(
                `${baseUrl}/employees/${id}/evaluations/${evaluationId}`,
                { headers: { Authorization: token } }
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

  const handleSwipeableWillOpen = (ref: Swipeable) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = ref;
  };

  const handleTapOutside = () => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close();
      openSwipeableRef.current = null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEmployee();
      return () => setAddEmployeeInfo("");
    }, [])
  );

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    evaluationId: string
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
        <TouchableOpacity
          onPress={() => handleDeleteEvaluation(evaluationId)}
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
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={handleTapOutside}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          onScrollBeginDrag={handleTapOutside}
          scrollEventThrottle={16}
        >
          <View style={{ padding: 24 }}>
            <TouchableOpacity
              onPress={() => router.push("/users")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Icon name="chevron-left" size={28} />
              <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 4 }}>
                Back
              </Text>
            </TouchableOpacity>

            {loading ? (
              <CardSkeleton amount={1} width="100%" height={160} />
            ) : (
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
            )}

            <View style={{ marginTop: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
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
                  <Text style={{ color: "#2563EB", marginLeft: 4 }}>
                    Create
                  </Text>
                </TouchableOpacity>
              </View>

              {evaluationFiles.length === 0 ? (
                <View
                  style={{
                    justifyContent: "center",
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
                evaluationFiles.map((file: any) => {
                  let swipeRef: Swipeable | null = null;
                  return (
                    <Swipeable
                      key={file._id}
                      ref={(ref) => (swipeRef = ref)}
                      friction={0.8}
                      overshootRight={true}
                      rightThreshold={10}
                      onSwipeableWillOpen={() =>
                        swipeRef && handleSwipeableWillOpen(swipeRef)
                      }
                      renderRightActions={(progress) =>
                        renderRightActions(progress, file._id)
                      }
                      containerStyle={{ width: "100%" }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/users/${id}/evaluations/${file._id}`)
                        }
                        activeOpacity={0.8}
                        style={{
                          width: "100%",
                          alignSelf: "center",
                          borderColor: "#E5E7EB",
                          borderWidth: 1,
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 12,
                          backgroundColor: "#FFFFFF",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: "600" }}>
                            {file.jobTitle || "Untitled Job"}
                          </Text>
                          <Text style={{ color: "#9CA3AF", marginTop: 4 }}>
                            Created: {formatISODate(file.createdAt)}
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
                                : "#DBEAFE",
                            color:
                              file.status === "complete"
                                ? "#065F46"
                                : "#1E3A8A",
                          }}
                        >
                          {file.status.replace("_", " ")}
                        </Text>
                      </TouchableOpacity>
                    </Swipeable>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default User;
