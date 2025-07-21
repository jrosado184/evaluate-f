import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Alert } from "react-native";
import { router, useGlobalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";

import getServerIP from "@/app/requests/NetworkAddress";
import unassignLocker from "@/app/requests/unassignLocker";
import useEmployeeContext from "@/app/context/EmployeeContext";

import SinglePressTouchable from "@/app/utils/SinglePress";
import LockerCard from "@/components/LockerCard";
import UnassignModal from "@/components/UnassignModal";
import CardSkeleton from "@/app/skeletons/CardSkeleton";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";

const Locker = () => {
  const { id } = useGlobalSearchParams();
  const { locker, setLocker } = useEmployeeContext();

  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingLockerId, setPendingLockerId] = useState<string | null>(null);

  /* -------- fetch locker ------- */
  const getLocker = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      const res = await axios.get(`${baseUrl}/lockers/${id}`, {
        headers: { Authorization: token },
      });
      setLocker(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch locker error:", err);
    }
  };

  useEffect(() => {
    getLocker();
  }, []);

  const refreshLocker = async () => {
    await getLocker();
  };

  /* ------- unassign flow -------- */
  const handleUnassignPress = (lockerId: string) => {
    setPendingLockerId(lockerId);
    setShowConfirm(true);
  };

  const confirmUnassign = async () => {
    if (!pendingLockerId) return;

    try {
      await unassignLocker(pendingLockerId);
      await refreshLocker();
      router.push("/(tabs)/lockers?toast=unassigned");
    } catch (err) {
      Alert.alert("Error", "Failed to unassign locker.");
    } finally {
      setShowConfirm(false);
      setPendingLockerId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      {/* Back */}
      <SinglePressTouchable
        onPress={() => router.back()}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <Icon name="chevron-left" size={28} />
        <Text style={{ marginLeft: 4, fontSize: 20, fontWeight: "600" }}>
          Back
        </Text>
      </SinglePressTouchable>

      {/* Card */}
      <View>
        {loading ? (
          <CardSkeleton amount={1} width="w-full" height="h-40" />
        ) : (
          <LockerCard
            vacant={locker?.vacant}
            button="edit"
            locker_number={locker?.locker_number}
            assigned_to={locker?.assigned_employee?.employee_name}
            assigned_by={locker?.assigned_by}
            location={locker?.location}
            last_updated={formatISODate(locker?.last_updated)}
            onUnassignPress={() => handleUnassignPress(locker._id)}
          />
        )}
      </View>

      {/* Confirmation Alert (native style) */}
      <UnassignModal
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmUnassign}
      />
    </SafeAreaView>
  );
};

export default Locker;
