import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SinglePressTouchable from "@/app/utils/SinglePress";
import { getAvatarMeta } from "@/app/helpers/avatar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import axios from "axios";

type ManagedUser = {
  _id: string;
  name: string;
  employee_id: string;
  email: string;
  role: string;
};

const rolePillStyles: Record<
  string,
  {
    container: string;
    dot: string;
    text: string;
  }
> = {
  admin: {
    container: "bg-violet-50",
    dot: "bg-violet-500",
    text: "text-violet-700",
  },
  trainer: {
    container: "bg-sky-50",
    dot: "bg-sky-500",
    text: "text-sky-700",
  },
  supervisor: {
    container: "bg-emerald-50",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  manager: {
    container: "bg-amber-50",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  default: {
    container: "bg-neutral-100",
    dot: "bg-neutral-500",
    text: "text-neutral-700",
  },
};

const normalizeRole = (rawRole: any): string => {
  if (typeof rawRole === "string") return rawRole;

  if (rawRole && typeof rawRole === "object") {
    if (typeof rawRole.role === "string") return rawRole.role;
    if (typeof rawRole.name === "string") return rawRole.name;
    if (typeof rawRole.label === "string") return rawRole.label;
  }

  return "";
};

const normalizeManagedUser = (user: any): ManagedUser => {
  return {
    _id: String(user?._id || ""),
    name: String(user?.name || user?.employee_name || "Unknown User"),
    employee_id: String(user?.employee_id || ""),
    email: String(user?.email || "-"),
    role: normalizeRole(user?.role),
  };
};

const getRolePillStyle = (role: string) => {
  const key = String(role || "")
    .trim()
    .toLowerCase();
  return rolePillStyles[key] || rolePillStyles.default;
};

const ManageUserAccess = () => {
  const [search, setSearch] = useState("");
  const [employeesWithRole, setEmployeesWithRole] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getEmployeesWithRole = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const response = await axios.get(`${baseUrl}/trainers/roles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const rawUsers = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const normalizedUsers = rawUsers.map(normalizeManagedUser);

        setEmployeesWithRole(normalizedUsers);
      } catch (error: any) {
        console.error(
          "Failed to load employees with role:",
          error?.response?.data || error?.message || error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    getEmployeesWithRole();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return employeesWithRole;

    return employeesWithRole.filter((user) => {
      return (
        user.name.toLowerCase().includes(q) ||
        user.employee_id.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q)
      );
    });
  }, [employeesWithRole, search]);

  const handleChangeUserRole = async (userId: string, nextRole: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();

      await axios.patch(
        `${baseUrl}/trainers/${userId}/role`,
        { role: nextRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEmployeesWithRole((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: nextRole } : user,
        ),
      );

      Alert.alert("Success", "User role updated successfully.");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update user role.",
      );
    }
  };

  const openRolePicker = (user: ManagedUser) => {
    Alert.alert("Change Role", `Update role for ${user.name}`, [
      {
        text: "Admin",
        onPress: () => handleChangeUserRole(user._id, "admin"),
      },
      {
        text: "Trainer",
        onPress: () => handleChangeUserRole(user._id, "trainer"),
      },
      {
        text: "Supervisor",
        onPress: () => handleChangeUserRole(user._id, "supervisor"),
      },
      {
        text: "Manager",
        onPress: () => handleChangeUserRole(user._id, "manager"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  return (
    <View className="bg-white rounded-[1.5rem] border border-neutral-200 px-5 py-6 shadow-sm">
      <View className="flex-row items-center mb-4">
        <Icon name="shield" size={18} color="#171717" />
        <Text className="ml-2 text-[1rem] font-inter-semibold text-neutral-900">
          Manage User Access
        </Text>
      </View>

      <Text className="text-[0.84rem] font-inter-medium text-neutral-500 mb-4">
        Search trainer accounts and update their access level.
      </Text>

      <View className="rounded-[1rem] bg-neutral-50 border border-neutral-200 px-4 py-3 mb-4">
        <Text className="text-[0.78rem] font-inter-medium text-neutral-500 mb-2">
          Search Users
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, employee ID, email, or role"
          placeholderTextColor="#A3A3A3"
          autoCapitalize="none"
          autoCorrect={false}
          className="text-[0.98rem] font-inter-semibold text-neutral-900"
        />
      </View>

      <View className="gap-3">
        {isLoading && (
          <View className="rounded-[1rem] bg-neutral-50 border border-neutral-200 px-4 py-5 items-center">
            <Text className="text-[0.9rem] font-inter-medium text-neutral-500">
              Loading users...
            </Text>
          </View>
        )}

        {!isLoading &&
          filteredUsers.map((user) => {
            const { initials, bg, text } = getAvatarMeta(user.name);
            const roleStyle = getRolePillStyle(user.role);

            return (
              <View
                key={user._id}
                className="rounded-[1rem] bg-neutral-50 border border-neutral-200 px-4 py-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center border border-neutral-200 ${bg}`}
                    >
                      <Text
                        className={`font-inter-bold text-[0.95rem] ${text}`}
                      >
                        {initials}
                      </Text>
                    </View>

                    <View className="ml-3 flex-1">
                      <Text className="text-[0.98rem] font-inter-semibold text-neutral-900">
                        {user.name}
                      </Text>
                      <Text className="text-[0.82rem] font-inter-medium text-neutral-500">
                        ID: {user.employee_id}
                      </Text>
                      <Text className="text-[0.82rem] font-inter-medium text-neutral-500">
                        {user.email}
                      </Text>
                    </View>
                  </View>

                  <SinglePressTouchable
                    onPress={() => openRolePicker(user)}
                    className="items-end"
                  >
                    <View
                      className={`flex-row items-center rounded-full px-3 py-2 ${roleStyle.container}`}
                    >
                      <Text
                        className={`text-[0.8rem] font-inter-semibold capitalize ${roleStyle.text}`}
                      >
                        {user.role || "No role"}
                      </Text>
                    </View>

                    <View className="mt-2 flex-row items-center">
                      <Text className="text-[0.75rem] font-inter-medium text-neutral-400 mr-1">
                        Change
                      </Text>
                      <Icon name="chevron-down" size={14} color="#A3A3A3" />
                    </View>
                  </SinglePressTouchable>
                </View>
              </View>
            );
          })}

        {!isLoading && !filteredUsers.length && (
          <View className="rounded-[1rem] bg-neutral-50 border border-neutral-200 px-4 py-5 items-center">
            <Text className="text-[0.9rem] font-inter-medium text-neutral-500">
              No users found.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ManageUserAccess;
