import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useGlobalSearchParams } from "expo-router";
import UserCard from "@/components/UserCard";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { formatISODate } from "@/app/conversions/ConvertIsoDate";
import CardSkeleton from "@/app/skeletons/CardSkeleton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import axios from "axios";
import Icon from "react-native-vector-icons/Feather";
import Folder from "react-native-vector-icons/AntDesign";
import RightIcon from "@/constants/icons/RightIcon";
import NewFolderModal from "@/components/NewFolderModal";
import Folders from "@/components/Folders";

const User = () => {
  const { id } = useGlobalSearchParams();
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [folderName, setFolderName] = useState("");

  const inputRef = useRef<TextInput>(null);

  const showModal = () => {
    setModalVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
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

      // Refresh employee data
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

  const handleModalCancel = () => {
    console.log("hi");
    setModalVisible(false);
    setFolderName("");
  };

  return (
    <SafeAreaView className="p-6 bg-neutral-50 h-full">
      <TouchableOpacity
        onPress={router.back}
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

      <View className="my-5">
        <View className="flex-row justify-between">
          <Text className="font-inter-semibold text-[1.2rem]">Files</Text>
          <TouchableOpacity
            onPress={showModal}
            className="font-inter-semibold text-[1.2rem] flex-row items-center justify-center border border-neutral-500 rounded-lg w-28 h-7 gap-1"
          >
            <Folder size={16} name="addfolder" />
            <Text className="text-[0.8rem]">New folder</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="my-3 w-full">
            <CardSkeleton amount={1} width="w-full" height="h-[4.5rem]" />
          </View>
        ) : (
          <View className="-mx-6">
            <Folders
              onDeleteFolder={handleDeleteFolder}
              onTapOutside={() => {
                setModalVisible(false);
                setFolderName("");
                handleModalCancel();
              }}
              handleModalCancel={handleModalCancel}
            />
          </View>
        )}
      </View>

      <NewFolderModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setFolderName("");
          handleModalCancel();
        }}
        onCreate={(name) => {
          handleCreateFolder(name);
          setModalVisible(false);
          setFolderName("");
        }}
        folderName={folderName}
        setFolderName={setFolderName}
      />
    </SafeAreaView>
  );
};

export default User;
