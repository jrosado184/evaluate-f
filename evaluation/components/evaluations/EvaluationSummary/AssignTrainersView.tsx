// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { getAvatarMeta } from "@/app/helpers/avatar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import getServerIP from "@/app/requests/NetworkAddress";
import { ActivityIndicator } from "react-native-paper";
import useAuthContext from "@/app/context/AuthContext";

const getInitials = (name?: string) => {
  if (!name || typeof name !== "string") return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const num = parseInt(normalized, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

const withAlpha = (hex: string, alpha: number) => {
  try {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return `rgba(37, 99, 235, ${alpha})`;
  }
};

const Avatar = ({
  name,
  size = 40,
  subtle = false,
}: {
  name?: string;
  size?: number;
  subtle?: boolean;
}) => {
  const { bg, text } = getAvatarMeta(name || "");
  const initials = getInitials(name);

  return (
    <View
      className="items-center justify-center rounded-full border"
      style={{
        width: size,
        height: size,
        borderColor: subtle ? "#E2E8F0" : "#DDE3EA",
        backgroundColor: subtle ? "#F8FAFC" : undefined,
      }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: size - 2,
          height: size - 2,
          backgroundColor: subtle ? "#F8FAFC" : undefined,
        }}
      >
        {!subtle ? (
          <View
            className={`items-center justify-center rounded-full ${bg}`}
            style={{
              width: size - 6,
              height: size - 6,
            }}
          >
            <Text
              className={`font-bold ${text}`}
              style={{ fontSize: size <= 28 ? 10 : 12, letterSpacing: 0.3 }}
            >
              {initials}
            </Text>
          </View>
        ) : (
          <Text
            className="font-bold text-[#475569]"
            style={{ fontSize: size <= 28 ? 10 : 12, letterSpacing: 0.3 }}
          >
            {initials}
          </Text>
        )}
      </View>
    </View>
  );
};

const normalizeAssigned = (evaluation: any) => {
  const raw =
    evaluation?.assignedEditors ||
    evaluation?.editors ||
    evaluation?.assignedTrainers ||
    evaluation?.trainers ||
    [];

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => ({
      id: item?._id || item?.id || item?.employee_id || item?.name,
      name: item?.name || item?.fullName || item?.trainerName || "",
      subtitle:
        item?.subtitle ||
        (item?.position && item?.employee_id
          ? `${item.position} · ${item.employee_id}`
          : item?.employee_id
            ? String(item.employee_id)
            : item?.position || ""),
    }))
    .filter((item) => item?.name);
};

const getSelectedIds = (items: any[]) =>
  items
    .map((item) => String(item?.id || ""))
    .filter(Boolean)
    .sort()
    .join("|");

export default function AssignTrainersView({
  evaluation,
  onBack,
  onSave,
  isSaving,
}: {
  evaluation: any;
  onBack: () => void;
  onSave: (selected: any[]) => void;
  isSaving?: boolean;
}) {
  const initialSelected = useMemo(
    () => normalizeAssigned(evaluation),
    [evaluation],
  );

  const [search, setSearch] = useState("");
  const [trainers, setTrainers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>(initialSelected);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuthContext();

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const res = await axios.get(`${baseUrl}/trainers/roles`, {
          headers: { Authorization: token! },
        });

        const normalized = Array.isArray(res.data)
          ? res.data.map((item: any) => ({
              id:
                item?._id ||
                item?.id ||
                item?.employee_id ||
                item?.employeeId ||
                item?.name,
              name: item?.name || item?.employee_name || item?.fullName || "",
              subtitle:
                item?.position && item?.employee_id
                  ? `${item.position} · ${item.employee_id}`
                  : item?.employee_id
                    ? String(item.employee_id)
                    : item?.position || "",
            }))
          : [];

        setTrainers(normalized.filter((item) => item?.name));
      } catch (e) {
        console.error("Failed to load trainers", e);
        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return trainers.filter((trainer) => {
      const trainerId = String(trainer.id || "").toLowerCase();

      if (currentUser?._id && trainerId === currentUser?._id) {
        return false;
      }

      if (!q) return true;

      return (
        String(trainer.name || "")
          .toLowerCase()
          .includes(q) ||
        trainerId.includes(q) ||
        String(trainer.subtitle || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [search, trainers, currentUser]);

  const hasChanges = useMemo(() => {
    return getSelectedIds(selected) !== getSelectedIds(initialSelected);
  }, [selected, initialSelected]);

  const isSelected = (trainer: any) =>
    selected.some((item) => String(item.id) === String(trainer.id));

  const toggleTrainer = (trainer: any) => {
    setSelected((prev) => {
      const exists = prev.some(
        (item) => String(item.id) === String(trainer.id),
      );
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(trainer.id));
      }
      return [...prev, trainer];
    });
  };

  return (
    <View className="flex-1 bg-[#F7F7F5]">
      <View className="px-4 pt-5 pb-2">
        <Text className="mb-3 text-[12px] leading-5 text-[#667085]">
          Select trainers who can edit weekly progress, comments, and
          signatures.
        </Text>

        <View
          className="mb-3 flex-row items-center rounded-2xl bg-white px-3"
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: "#D9E2EC",
          }}
        >
          <Icon name="search" size={16} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search trainer by name or ID"
            placeholderTextColor="#98A2B3"
            className="ml-2 flex-1 text-[14px] font-medium text-[#111827]"
          />
        </View>

        <Text className="text-[11px] leading-4 text-[#98A2B3]">
          Assigned trainers can edit weekly progress, comments, and signatures.
        </Text>
      </View>

      {/* Removed feature to consider */}
      {/* {selected.length > 0 ? (
        <View className="px-4 pt-3">
          <View
            className="rounded-2xl bg-white p-4"
            style={{ borderWidth: 1, borderColor: "#E3E8EF" }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[13px] font-semibold text-[#344054]">
                Selected Trainers
              </Text>
              <Text className="text-[12px] font-medium text-[#667085]">
                {selected.length} selected
              </Text>
            </View>

            <View className="flex-row flex-wrap">
              {selected.map((trainer: any, index: number) => {
                const { bg } = getAvatarMeta(trainer.name || "");
                const tintHex =
                  bg === "bg-[#DCFCE7]"
                    ? "#86EFAC"
                    : bg === "bg-[#EDE9FE]"
                      ? "#C4B5FD"
                      : bg === "bg-[#FCE7F3]"
                        ? "#F9A8D4"
                        : bg === "bg-[#FEF3C7]"
                          ? "#FCD34D"
                          : bg === "bg-[#DBEAFE]"
                            ? "#93C5FD"
                            : "#BFDBFE";

                return (
                  <View
                    key={trainer.id || `${trainer.name}-${index}`}
                    className="mb-2 mr-2 flex-row items-center rounded-full px-2 py-1.5"
                    style={{
                      borderWidth: 1,
                      borderColor: withAlpha(tintHex, 0.42),
                      backgroundColor: withAlpha(tintHex, 0.14),
                    }}
                  >
                    <Avatar name={trainer.name} size={26} />
                    <Text className="ml-2 text-[12px] font-medium text-[#334155]">
                      {trainer.name}
                    </Text>
                    <SinglePressTouchable
                      onPress={() => toggleTrainer(trainer)}
                      className="ml-2 rounded-full p-1"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.82)",
                      }}
                    >
                      <Icon name="x" size={12} color="#64748B" />
                    </SinglePressTouchable>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      ) : null} */}

      <View className="flex-1 px-4 pt-3">
        <View
          className="flex-1 rounded-2xl bg-white p-3"
          style={{ borderWidth: 1, borderColor: "#E3E8EF" }}
        >
          <View className="mb-3 flex-row items-center justify-between px-0.5">
            <Text className="text-[13px] font-semibold text-[#344054]">
              Available Trainers
            </Text>
            <Text className="text-[12px] text-[#667085]">
              {loading ? "" : `${filtered.length} results`}
            </Text>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center py-10">
              <ActivityIndicator size="small" color="#1D4ED8" />
              <Text className="mt-3 text-[13px] text-[#64748B]">
                Loading trainers...
              </Text>
            </View>
          ) : filtered.length > 0 ? (
            filtered.map((trainer: any) => {
              const selectedState = isSelected(trainer);

              return (
                <SinglePressTouchable
                  activeOpacity={0.9}
                  key={trainer.id}
                  onPress={() => toggleTrainer(trainer)}
                  className="mb-3 rounded-2xl px-3 py-3"
                  style={{
                    borderWidth: 1,
                    borderColor: selectedState ? "#BFDBFE" : "#E5E7EB",
                    backgroundColor: selectedState ? "#F8FBFF" : "#FFFFFF",
                  }}
                >
                  <View className="flex-row items-center">
                    <Avatar name={trainer.name} size={40} />

                    <View className="ml-3 flex-1">
                      <Text
                        className="text-[14px] font-semibold"
                        style={{
                          color: selectedState ? "#0F172A" : "#111827",
                        }}
                      >
                        {trainer.name}
                      </Text>
                      {!!trainer.subtitle && (
                        <Text className="mt-0.5 text-[12px] text-[#6B7280]">
                          {trainer.subtitle}
                        </Text>
                      )}
                    </View>

                    <View
                      className={`h-6 w-6 items-center justify-center rounded-full ${
                        selectedState ? "bg-[#2563EB]" : "bg-white"
                      }`}
                      style={{
                        borderWidth: 1.5,
                        borderColor: selectedState ? "#2563EB" : "#CBD5E1",
                      }}
                    >
                      {selectedState ? (
                        <Icon name="check" size={13} color="#FFFFFF" />
                      ) : null}
                    </View>
                  </View>
                </SinglePressTouchable>
              );
            })
          ) : (
            <View
              className="items-center rounded-2xl px-4 py-8"
              style={{
                borderWidth: 1,
                borderColor: "#E6EBF2",
                borderStyle: "dashed",
              }}
            >
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-[#F8FAFC]">
                <Icon name="search" size={18} color="#94A3B8" />
              </View>
              <Text className="text-center text-[13px] font-semibold text-[#475467]">
                No trainers found
              </Text>
              <Text className="mt-1 text-center text-[12px] leading-5 text-[#98A2B3]">
                Try a different trainer name or employee ID.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        className="bg-white px-4 pt-3 pb-6"
        style={{ borderTopWidth: 1, borderTopColor: "#EEF2F6" }}
      >
        <View className="flex-row items-center">
          <SinglePressTouchable
            onPress={onBack}
            className="mr-3 flex-1 items-center justify-center rounded-2xl bg-white py-3.5"
            style={{ borderWidth: 1, borderColor: "#D9E2EC" }}
          >
            <Text className="text-[14px] font-semibold text-[#344054]">
              Cancel
            </Text>
          </SinglePressTouchable>

          <SinglePressTouchable
            onPress={() => {
              if (!hasChanges || isSaving) return;
              onSave(selected);
            }}
            className="flex-1 items-center justify-center rounded-2xl py-3.5"
            style={{
              backgroundColor: !hasChanges || isSaving ? "#94A3B8" : "#1D4ED8",
              opacity: !hasChanges || isSaving ? 0.7 : 1,
            }}
          >
            <Text className="text-[14px] font-semibold text-white">
              {isSaving ? "Saving..." : "Save Trainers"}
            </Text>
          </SinglePressTouchable>
        </View>
      </View>
    </View>
  );
}
