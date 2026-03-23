import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  Modal,
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/EvilIcons";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import debounce from "lodash.debounce";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import useEmployeeContext from "@/app/context/EmployeeContext";
import usePagination from "@/hooks/usePagination";
import getServerIP from "@/app/requests/NetworkAddress";

import SinglePressTouchable from "@/app/utils/SinglePress";
import Search from "@/components/Search";
import AssignEmployeeCard from "./users/AssignUserCard";
import AssignLockerCard from "./users/AssignLockerCard";
import SuccessModal from "./SuccessModal";
import useAuthContext from "@/app/context/AuthContext";
import EvaluationSheet from "@/components/ui/sheets/EvaluationSheet";

type ModalView = "picker" | "summary" | "step1" | "step2" | "qualify";

const SlideUpModal = ({
  visible,
  onClose,
  lockerId,
  onLockerSelected,
  onAssignmentComplete,
  mode = "assignEmployee",
  source,
  filter,
}: any) => {
  const screenHeight = Dimensions.get("window").height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);

  const {
    setLoading,
    loading,
    employees,
    lockers,
    setEmployees,
    setLockers,
    setUserDetails,
    userDetails,
  } = useEmployeeContext();

  const { currentUser } = useAuthContext();

  const [query, setQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTrigger, setToastTrigger] = useState(0);

  const [modalView, setModalView] = useState<ModalView>("picker");
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    string | null
  >(null);
  const [step2Week, setStep2Week] = useState<number>(1);
  const [qualifyPayload, setQualifyPayload] = useState<any>(null);
  const [creatingEvaluation, setCreatingEvaluation] = useState(false);

  const isEmployeeMode = mode === "assignEmployee";
  const showingEvaluationFlow = modalView !== "picker";

  const getDataRef = useRef<(page?: number, limit?: number) => Promise<any>>();
  getDataRef.current = async (page = 1, limit = 8) => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();

    const url = isEmployeeMode
      ? `${baseUrl}/employees?page=${page}&limit=${limit}`
      : `${baseUrl}/lockers?page=${page}&limit=${limit}&location=${filter ?? ""}`;

    const res = await axios.get(url, {
      headers: { Authorization: token },
    });

    return {
      results: res.data.results ?? [],
      totalPages: res.data.totalPages ?? 1,
      currentPage: res.data.currentPage ?? 1,
    };
  };

  const getData = useCallback(
    (page = 1, limit = 8) => getDataRef.current!(page, limit),
    [],
  );

  const {
    getMoreData,
    getInitialData,
    resetPagination,
    fetchingMoreUsers,
    setIsSearching,
  } = usePagination(
    isEmployeeMode ? employees : lockers,
    getData,
    isEmployeeMode ? setEmployees : setLockers,
    setUserDetails,
    userDetails,
    8,
  );

  const resetFlowState = useCallback(() => {
    setModalView("picker");
    setSelectedEvaluationId(null);
    setStep2Week(1);
    setQualifyPayload(null);
    setCreatingEvaluation(false);
  }, []);

  const resetPickerState = useCallback(() => {
    setQuery("");
    setFilteredItems([]);
    setSearchLoading(false);
    setIsSearching(false);
  }, [setIsSearching]);

  const debouncedFetch = useCallback(
    debounce(async (searchTerm: string) => {
      try {
        setSearchLoading(true);

        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const url = isEmployeeMode
          ? `${baseUrl}/employees/search?query=${encodeURIComponent(
              searchTerm,
            )}&type=employees&limit=8`
          : `${baseUrl}/lockers?page=1&limit=8&search=${encodeURIComponent(
              searchTerm,
            )}${filter ? `&location=${encodeURIComponent(filter)}` : ""}`;

        const res = await axios.get(url, {
          headers: { Authorization: token },
        });

        setFilteredItems(res.data.users || res.data.results || []);
        setIsSearching(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    [isEmployeeMode, filter, setIsSearching],
  );

  useEffect(() => {
    if (!visible) return;

    isClosing.current = false;
    resetPickerState();
    resetFlowState();

    slideAnim.setValue(screenHeight);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    if (isEmployeeMode) {
      setEmployees([]);
    } else {
      setLockers([]);
    }

    resetPagination();
    getInitialData().finally(() => setLoading(false));
  }, [
    visible,
    isEmployeeMode,
    screenHeight,
    opacityAnim,
    slideAnim,
    setLoading,
    setEmployees,
    setLockers,
    resetPagination,
    getInitialData,
    resetPickerState,
    resetFlowState,
  ]);

  useEffect(() => {
    if (!visible || showingEvaluationFlow) return;

    if (query.trim() === "") {
      setFilteredItems([]);
      setIsSearching(false);
      debouncedFetch.cancel();
      return;
    }

    debouncedFetch(query.trim());

    return () => debouncedFetch.cancel();
  }, [query, visible, showingEvaluationFlow, debouncedFetch, setIsSearching]);

  const animateClose = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;

    debouncedFetch.cancel();

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetPickerState();
      resetFlowState();
      onClose?.();
    });
  }, [
    debouncedFetch,
    opacityAnim,
    screenHeight,
    slideAnim,
    onClose,
    resetPickerState,
    resetFlowState,
  ]);

  const handleHeaderPress = useCallback(() => {
    if (modalView === "picker") {
      animateClose();
      return;
    }

    setModalView("picker");
    setSelectedEvaluationId(null);
    setStep2Week(1);
    setQualifyPayload(null);
  }, [modalView, animateClose]);

  const handleAssign = useCallback(
    async (employeeId: string) => {
      if (source === "dashboard") {
        try {
          setCreatingEvaluation(true);

          const token = await AsyncStorage.getItem("token");
          const baseUrl = await getServerIP();

          const response = await axios.post(
            `${baseUrl}/employees/${employeeId}/evaluations`,
            {
              position: "Untitled",
              createdBy:
                currentUser?.name || userDetails?.currentUser?.name || "System",
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );

          const newEvalId = response.data._id;

          setSelectedEvaluationId(newEvalId);
          setModalView("step1");
          setStep2Week(1);
          setQualifyPayload(null);
          return;
        } catch (error: any) {
          console.error(
            "Failed to start evaluation:",
            error?.response || error,
          );
          Alert.alert("Error", "Could not start evaluation.");
          return;
        } finally {
          setCreatingEvaluation(false);
        }
      }

      if (!lockerId) {
        Alert.alert("Error", "No locker selected.");
        return;
      }

      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const response = await axios.post(
          `${baseUrl}/lockers/assign`,
          { lockerId, employeeId, assigned_by: currentUser?.name },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status === 200) {
          onAssignmentComplete?.();
          setToastMessage("Locker successfully assigned!");
          setToastTrigger(Date.now());
          animateClose();
        }
      } catch (error: any) {
        console.error(
          "Assignment failed:",
          error?.response?.data || error.message,
        );
        Alert.alert(
          "Error",
          error?.response?.data?.error || "Failed to assign locker",
        );
      }
    },
    [
      source,
      lockerId,
      currentUser?.name,
      userDetails?.currentUser?.name,
      onAssignmentComplete,
      animateClose,
    ],
  );

  const handleLockerSelection = useCallback(
    (locker: any) => {
      onLockerSelected?.(locker);
      animateClose();
    },
    [onLockerSelected, animateClose],
  );

  const renderItem = useCallback(
    ({ item }: any) => {
      if (isEmployeeMode) {
        return (
          <SinglePressTouchable
            onPress={() => handleAssign(item._id)}
            activeOpacity={0.82}
          >
            <AssignEmployeeCard
              source={source}
              {...item}
              assigned={!!item.locker_id}
            />
          </SinglePressTouchable>
        );
      }

      return (
        <SinglePressTouchable
          onPress={() => handleLockerSelection(item)}
          activeOpacity={0.82}
        >
          <AssignLockerCard {...item} />
        </SinglePressTouchable>
      );
    },
    [isEmployeeMode, handleAssign, source, handleLockerSelection],
  );

  const listData =
    query.trim() === ""
      ? isEmployeeMode
        ? employees
        : lockers
      : filteredItems;

  const headerTitle =
    modalView === "step1"
      ? "Personal Information"
      : modalView === "step2"
        ? "Weekly Evaluation"
        : modalView === "qualify"
          ? "Final Qualification"
          : modalView === "summary"
            ? "Evaluation Summary"
            : isEmployeeMode
              ? "Select Employee"
              : "Select Locker";

  const headerSubtitle =
    modalView === "picker"
      ? isEmployeeMode
        ? "Choose a team member to continue"
        : "Choose an available locker"
      : undefined;

  return (
    <>
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={animateClose}
      >
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <SinglePressTouchable
            style={styles.overlayTapArea}
            onPress={animateClose}
          />

          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View className="mb-3 items-center">
              <View className="h-1.5 w-12 rounded-full bg-gray-300" />
            </View>

            {/* Header */}
            <View className="mb-3 flex-row items-center">
              <SinglePressTouchable
                onPress={handleHeaderPress}
                activeOpacity={0.8}
              >
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Icon
                    name={modalView === "picker" ? "close" : "chevron-left"}
                    size={modalView === "picker" ? 28 : 34}
                    color="#374151"
                  />
                </View>
              </SinglePressTouchable>

              <View>
                <Text className="text-[20px] font-bold text-gray-900">
                  {headerTitle}
                </Text>
                {!!headerSubtitle && (
                  <Text className="mt-0.5 text-[13px] text-gray-500">
                    {headerSubtitle}
                  </Text>
                )}
              </View>
            </View>

            {modalView === "picker" ? (
              <>
                <View>
                  <Search
                    noFilter
                    total={isEmployeeMode ? "employees" : "lockers"}
                    query={query}
                    setQuery={setQuery}
                  />
                </View>

                <View className="flex-1">
                  {loading || searchLoading || creatingEvaluation ? (
                    <View className="flex-1 items-center justify-center">
                      <ActivityIndicator size="large" color="#111827" />
                      <Text className="mt-3 text-[14px] font-medium text-gray-500">
                        {creatingEvaluation
                          ? "Starting evaluation..."
                          : query.trim()
                            ? "Searching..."
                            : "Loading..."}
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={listData}
                      keyExtractor={(item, index) =>
                        item?._id?.toString() || String(index)
                      }
                      renderItem={renderItem}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      onEndReached={() => {
                        if (query.trim() !== "" || fetchingMoreUsers) return;
                        if (userDetails.currentPage < userDetails.totalPages) {
                          getMoreData();
                        }
                      }}
                      onEndReachedThreshold={0.2}
                      ListFooterComponent={
                        fetchingMoreUsers ? (
                          <View className="py-4">
                            <ActivityIndicator size="small" color="#111827" />
                          </View>
                        ) : null
                      }
                      ListEmptyComponent={
                        <View className="mt-16 items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50 px-6 py-10">
                          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
                            <MaterialCommunityIcons
                              name={
                                isEmployeeMode
                                  ? "account-search-outline"
                                  : "locker"
                              }
                              size={22}
                              color="#9CA3AF"
                            />
                          </View>
                          <Text className="mt-4 text-[17px] font-semibold text-gray-800">
                            No results found
                          </Text>
                          <Text className="mt-2 text-center text-[14px] leading-5 text-gray-500">
                            {query.trim()
                              ? `No ${isEmployeeMode ? "employees" : "lockers"} matched your search.`
                              : `No ${isEmployeeMode ? "employees" : "lockers"} available right now.`}
                          </Text>
                        </View>
                      }
                      contentContainerStyle={{
                        paddingTop: 8,
                        paddingBottom: 20,
                      }}
                    />
                  )}
                </View>
              </>
            ) : (
              <View className="flex-1">
                <EvaluationSheet
                  sheetView={
                    modalView as "summary" | "step1" | "step2" | "qualify"
                  }
                  setSheetView={setModalView as any}
                  evaluationId={selectedEvaluationId}
                  setEvaluationId={setSelectedEvaluationId}
                  step2Week={step2Week}
                  setStep2Week={setStep2Week}
                  qualifyPayload={qualifyPayload}
                  setQualifyPayload={setQualifyPayload}
                  onClose={animateClose}
                  onRefresh={async () => {}}
                />
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>

      <SuccessModal
        message={toastMessage}
        trigger={toastTrigger}
        clearMessage={() => setToastMessage("")}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.28)",
    justifyContent: "flex-end",
  },
  overlayTapArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    height: "92%",
  },
});

export default SlideUpModal;
