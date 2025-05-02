import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
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
import RightIcon from "@/constants/icons/RightIcon";
import NewFolderModal from "@/components/NewFolderModal";
import Folders from "@/components/Folders";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import EditFolderModal from "@/components/EditFolderModal";

const User = () => {
  const { id } = useGlobalSearchParams();
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [editFolderName, setEditFolderName] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState("");

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

  const handleEditFolder = async (newName: string) => {
    if (!newName.trim()) return;

    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();

    try {
      await axios.patch(
        `${baseUrl}/employees/${id}/folders/${currentFolderId}`,
        { name: newName.trim() },
        {
          headers: { Authorization: token },
        }
      );

      const res = await axios.get(`${baseUrl}/employees/${id}`, {
        headers: { Authorization: token },
      });

      setEmployee(res.data);
      setAddEmployeeInfo(res.data);
      handleEditModalClose();
    } catch (error) {
      console.error("Error editing folder:", error);
      Alert.alert("Error", "Failed to update folder name.");
    }
  };

  const handleCreateFolder = async (name: string) => {
    if (!name || !name.trim()) return;

    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();

    try {
      await axios.post(
        `${baseUrl}/employees/${id}/folders`,
        { name: name.trim() },
        {
          headers: { Authorization: token },
        }
      );

      const res = await axios.get(`${baseUrl}/employees/${id}`, {
        headers: { Authorization: token },
      });

      setEmployee(res.data);
      setAddEmployeeInfo(res.data);
    } catch (error) {
      console.error("Error creating folder:", error);
      Alert.alert("Error", "Failed to create folder.");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const token = await AsyncStorage.getItem("token");
    const baseUrl = await getServerIP();

    try {
      await axios.delete(`${baseUrl}/employees/${id}/folders/${folderId}`, {
        headers: { Authorization: token },
      });

      const res = await axios.get(`${baseUrl}/employees/${id}`, {
        headers: { Authorization: token },
      });

      setEmployee(res.data);
      setAddEmployeeInfo(res.data);
    } catch (error) {
      console.error("Error deleting folder:", error);
      Alert.alert("Error", "Failed to delete folder.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      const getUser = async () => {
        const token = await AsyncStorage.getItem("token");
        const baseUrl = await getServerIP();

        axios
          .get(`${baseUrl}/employees/${id}`, {
            headers: {
              Authorization: token,
            },
          })
          .then((res) => {
            setLoading(false);
            setEmployee(res.data);
            setAddEmployeeInfo(res.data);
          })
          .catch((error) => {
            throw new Error(error);
          });
      };
      getUser();
      return () => {
        setAddEmployeeInfo("");
      };
    }, [])
  );

  return (
    <SafeAreaView className="bg-neutral-50 h-full">
      <View className="p-6">
        <TouchableOpacity
          onPress={() => router.push("/users")}
          className="flex-row items-center h-10"
        >
          <Icon name="chevron-left" size={29} />
          <Text className="text-[1.3rem]">Back</Text>
        </TouchableOpacity>

        <View className="my-4">
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
        </View>

        <View className="my-4">
          <View className="flex-row justify-between items-center">
            <Text className="font-inter-semibold text-[1.2rem]">Files</Text>
            <TouchableOpacity
              onPress={handleNewFolderPress}
              className="font-inter-semibold text-[1.2rem] flex-row items-center justify-center border border-neutral-500 rounded-lg w-28 h-7 gap-1"
            >
              <Folder size={16} name="addfolder" />
              <Text className="text-[0.8rem]">New folder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="my-3 w-full px-6">
          <CardSkeleton amount={1} width="w-full" height="h-[4.5rem]" />
        </View>
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
