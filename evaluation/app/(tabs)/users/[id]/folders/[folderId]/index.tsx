import { View, Text, ScrollView, FlatList } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useGlobalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Folder from "react-native-vector-icons/AntDesign";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import UserCard from "@/components/UserCard";
import CardSkeleton from "@/app/skeletons/CardSkeleton";
import NewFolderModal from "@/components/NewFolderModal";
import Folders from "@/components/Folders";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import EditFolderModal from "@/components/EditFolderModal";
import SinglePressTouchable from "@/app/utils/SinglePress";

const User = () => {
  const { id } = useGlobalSearchParams();
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [editFolderName, setEditFolderName] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState("");
  const [evaluations, setEvaluations] = useState([]);

  const closeSwipeableFn = useRef<() => void>();

  const handleModalCancel = () => {
    closeSwipeableFn.current?.();
    setModalVisible(false);
    setFolderName("");
  };

  const handleEditModalClose = () => {
    closeSwipeableFn.current?.();
    setEditModalVisible(false);
    setCurrentFolderId("");
    setEditFolderName("");
  };

  const handleNewFolderPress = () => {
    closeSwipeableFn.current?.();
    setModalVisible(true);
  };

  const openEditModal = (folderId: string, name: string) => {
    closeSwipeableFn.current?.();
    setTimeout(() => {
      setEditFolderName(name);
      setCurrentFolderId(folderId);
      setEditModalVisible(true);
    }, 10);
  };

  const fetchEmployee = async () => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();
    const res = await axios.get(`${baseUrl}/employees/${id}`, {
      headers: { Authorization: token },
    });
    setEmployee(res.data);
    setAddEmployeeInfo(res.data);

    // Gather evaluation files
    const allFiles =
      res.data?.folders?.flatMap(
        (folder: any) =>
          folder.files?.map((file: any) => ({
            ...file,
            folderName: folder.name,
            folderId: folder._id,
          })) || []
      ) || [];

    const filtered = allFiles.filter(
      (file: any) =>
        file.status === "evaluation_started" || file.status === "complete"
    );
    setEvaluations(filtered);
  };

  const handleCreateFolder = async (name: string) => {
    if (!name.trim()) return;
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();
    await axios.post(
      `${baseUrl}/employees/${id}/folders`,
      { name: name.trim() },
      { headers: { Authorization: token } }
    );
    fetchEmployee();
  };

  const handleEditFolder = async (newName: string) => {
    if (!newName.trim()) return;
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();
    await axios.patch(
      `${baseUrl}/employees/${id}/folders/${currentFolderId}`,
      { name: newName.trim() },
      { headers: { Authorization: token } }
    );
    fetchEmployee();
    handleEditModalClose();
  };

  const handleDeleteFolder = async (folderId: string) => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();
    await axios.delete(`${baseUrl}/employees/${id}/folders/${folderId}`, {
      headers: { Authorization: token },
    });
    fetchEmployee();
  };

  useFocusEffect(
    useCallback(() => {
      fetchEmployee().then(() => setLoading(false));
      return () => setAddEmployeeInfo("");
    }, [])
  );

  const renderEvaluationCard = ({ item }: { item: any }) => (
    <SinglePressTouchable
      onPress={() => router.push(`/users/${id}/evaluations/${item._id}`)}
      className="bg-white shadow-md rounded-xl px-4 py-3 mb-3 mx-6 border border-gray-200"
    >
      <Text className="font-semibold text-base mb-1">{item.name}</Text>
      <Text className="text-xs text-gray-500">Folder: {item.folderName}</Text>
      <Text className="text-xs text-gray-500 mt-1">Status: {item.status}</Text>
      <Text className="text-xs text-gray-400 mt-1">
        Uploaded: {formatISODate(item.uploadedAt)}
      </Text>
    </SinglePressTouchable>
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="p-6">
          <SinglePressTouchable
            onPress={() => router.push("/users")}
            className="flex-row items-center mb-4"
          >
            <Icon name="chevron-left" size={28} />
            <Text className="text-xl font-semibold ml-1">Back</Text>
          </SinglePressTouchable>

          {loading ? (
            <CardSkeleton amount={1} width="w-full" height="h-40" />
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

          <View className="my-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold">Folders</Text>
              <SinglePressTouchable
                onPress={handleNewFolderPress}
                className="flex-row items-center border border-neutral-400 rounded-lg px-3 py-1"
              >
                <Folder name="addfolder" size={16} />
                <Text className="text-sm ml-1">New folder</Text>
              </SinglePressTouchable>
            </View>
            {loading ? (
              <CardSkeleton amount={1} width="w-full" height="h-[4.5rem]" />
            ) : (
              <Folders
                onDeleteFolder={handleDeleteFolder}
                onEditPress={openEditModal}
                onTapOutside={handleModalCancel}
                registerCloseSwipeable={(fn) => {
                  closeSwipeableFn.current = fn;
                }}
              />
            )}
          </View>

          <View className="my-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold">Evaluations</Text>
              <SinglePressTouchable
                onPress={() => router.push(`/users/${id}/evaluations`)}
                className="flex-row items-center border border-blue-600 rounded-lg px-3 py-1"
              >
                <Icon name="clipboard" size={16} color="blue" />
                <Text className="text-sm ml-1 text-blue-600">Start</Text>
              </SinglePressTouchable>
            </View>

            <FlatList
              data={evaluations}
              keyExtractor={(item) => item._id}
              renderItem={renderEvaluationCard}
              ListEmptyComponent={
                <Text className="text-sm text-center text-gray-400">
                  No evaluations yet.
                </Text>
              }
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>

      <NewFolderModal
        visible={modalVisible}
        onClose={handleModalCancel}
        onCreate={(name) => {
          handleCreateFolder(name);
          handleModalCancel();
        }}
        folderName={folderName}
        setFolderName={setFolderName}
      />

      <EditFolderModal
        visible={editModalVisible}
        onClose={handleEditModalClose}
        onSubmit={handleEditFolder}
        folderName={editFolderName}
        setFolderName={setEditFolderName}
      />
    </SafeAreaView>
  );
};

export default User;
