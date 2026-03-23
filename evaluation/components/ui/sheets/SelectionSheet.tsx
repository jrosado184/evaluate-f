import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import debounce from "lodash.debounce";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Search from "@/components/Search";
import SinglePressTouchable from "@/app/utils/SinglePress";
import getServerIP from "@/app/requests/NetworkAddress";
import useAuthContext from "@/app/context/AuthContext";

import AssignEmployeeCard from "@/components/users/AssignUserCard";
import AssignLockerCard from "@/components/users/AssignLockerCard";

type SelectionMode = "employees" | "lockers";

type SelectionSheetProps = {
  mode: SelectionMode;
  source?: string;
  filter?: string;
  lockerId?: string;
  onLockerSelected?: (locker: any) => void;
  onEmployeeAssigned?: () => void;
  onEmployeeSelected?: (employeeId: string) => void;
};

const PAGE_SIZE = 8;

const SelectionSheet: React.FC<SelectionSheetProps> = ({
  mode,
  source,
  filter,
  lockerId,
  onLockerSelected,
  onEmployeeAssigned,
  onEmployeeSelected,
}) => {
  const isEmployeeMode = mode === "employees";
  const { currentUser } = useAuthContext();

  const mountedRef = useRef(true);

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const buildListUrl = useCallback(
    async (page = 1, limit = PAGE_SIZE) => {
      const baseUrl = await getServerIP();

      if (isEmployeeMode) {
        return `${baseUrl}/employees?page=${page}&limit=${limit}`;
      }

      return `${baseUrl}/lockers?page=${page}&limit=${limit}&location=${encodeURIComponent(filter ?? "")}`;
    },
    [isEmployeeMode, filter],
  );

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setItems([]);
      setFilteredItems([]);
      setCurrentPage(1);
      setTotalPages(1);

      const token = await AsyncStorage.getItem("token");
      const url = await buildListUrl(1, PAGE_SIZE);

      const res = await axios.get(url, {
        headers: { Authorization: token },
      });

      if (!mountedRef.current) return;

      const nextItems = res.data?.results ?? [];
      setItems(nextItems);
      setCurrentPage(res.data?.currentPage ?? 1);
      setTotalPages(res.data?.totalPages ?? 1);
    } catch (err) {
      console.error("SelectionSheet initial load error:", err);
      if (mountedRef.current) {
        setItems([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [buildListUrl]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (fetchingMore || loading) return;
    if (query.trim()) return;
    if (currentPage >= totalPages) return;

    try {
      setFetchingMore(true);

      const nextPage = currentPage + 1;
      const token = await AsyncStorage.getItem("token");
      const url = await buildListUrl(nextPage, PAGE_SIZE);

      const res = await axios.get(url, {
        headers: { Authorization: token },
      });

      if (!mountedRef.current) return;

      const nextItems = res.data?.results ?? [];
      setItems((prev) => [...prev, ...nextItems]);
      setCurrentPage(res.data?.currentPage ?? nextPage);
      setTotalPages(res.data?.totalPages ?? totalPages);
    } catch (err) {
      console.error("SelectionSheet loadMore error:", err);
    } finally {
      if (mountedRef.current) {
        setFetchingMore(false);
      }
    }
  }, [fetchingMore, loading, query, currentPage, totalPages, buildListUrl]);

  const debouncedSearchRef = useRef(
    debounce(async (searchTerm: string, empMode: boolean, f?: string) => {
      try {
        if (!mountedRef.current) return;

        setSearchLoading(true);

        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const url = empMode
          ? `${baseUrl}/employees/search?query=${encodeURIComponent(searchTerm)}&type=employees&limit=${PAGE_SIZE}`
          : `${baseUrl}/lockers?page=1&limit=${PAGE_SIZE}&search=${encodeURIComponent(searchTerm)}${
              f ? `&location=${encodeURIComponent(f)}` : ""
            }`;

        const res = await axios.get(url, {
          headers: { Authorization: token },
        });

        if (!mountedRef.current) return;

        setFilteredItems(res.data?.users || res.data?.results || []);
      } catch (err) {
        console.error("SelectionSheet search error:", err);
        if (mountedRef.current) {
          setFilteredItems([]);
        }
      } finally {
        if (mountedRef.current) {
          setSearchLoading(false);
        }
      }
    }, 300),
  );

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      debouncedSearchRef.current.cancel();
      setFilteredItems([]);
      setSearchLoading(false);
      return;
    }

    debouncedSearchRef.current(trimmed, isEmployeeMode, filter);

    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, [query, isEmployeeMode, filter]);

  useEffect(() => {
    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, []);

  const handleEmployeePress = useCallback(
    async (employeeId: string) => {
      if (source === "dashboard") {
        onEmployeeSelected?.(employeeId);
        return;
      }

      if (onEmployeeSelected && !lockerId) {
        onEmployeeSelected(employeeId);
        return;
      }

      if (!lockerId) {
        Alert.alert("Error", "No locker selected.");
        return;
      }

      try {
        setActionLoading(true);

        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        const response = await axios.post(
          `${baseUrl}/lockers/assign`,
          {
            lockerId,
            employeeId,
            assigned_by: currentUser?.name,
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status === 200) {
          onEmployeeAssigned?.();
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
      } finally {
        if (mountedRef.current) {
          setActionLoading(false);
        }
      }
    },
    [
      source,
      lockerId,
      currentUser?.name,
      onEmployeeAssigned,
      onEmployeeSelected,
    ],
  );

  const listData = useMemo(() => {
    return query.trim() ? filteredItems : items;
  }, [query, filteredItems, items]);

  const renderItem = useCallback(
    ({ item }: any) => {
      if (isEmployeeMode) {
        return (
          <SinglePressTouchable
            onPress={() => handleEmployeePress(item._id)}
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
        <AssignLockerCard {...item} onPress={() => onLockerSelected?.(item)} />
      );
    },
    [isEmployeeMode, handleEmployeePress, onLockerSelected, source],
  );

  return (
    <View className="flex-1 px-4 pb-4">
      <Search
        noFilter
        total={isEmployeeMode ? "employees" : "lockers"}
        query={query}
        setQuery={setQuery}
      />

      <View className="mt-2 flex-1">
        {loading || searchLoading || actionLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#111827" />
            <Text className="mt-3 text-[14px] font-medium text-gray-500">
              {actionLoading
                ? "Assigning..."
                : query.trim()
                  ? "Searching..."
                  : "Loading..."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item, index) =>
              item?._id?.toString?.() || String(index)
            }
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              fetchingMore ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#111827" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="mt-16 items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50 px-6 py-10">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
                  <MaterialCommunityIcons
                    name={isEmployeeMode ? "account-search-outline" : "locker"}
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
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
};

export default SelectionSheet;
