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

const User = () => {
  const { id } = useGlobalSearchParams();
  const { employee, setEmployee, setAddEmployeeInfo } = useEmployeeContext();

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [folderName, setFolderName] = useState("");

  const inputRef = useRef<TextInput>(null);

  // 👇 NEW: showModal handler
  const showModal = () => {
    setModalVisible(true);
    setTimeout(() => {
      inputRef.current?.focus(); // instant keyboard
    }, 10); // tiny delay to ensure render
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
          <View className="my-3">
            <CardSkeleton amount={1} width="w-full" height="h-[4.5rem]" />
          </View>
        ) : (
          <View className="my-4 gap-y-4">
            {employee?.folders.map((folder) => (
              <TouchableOpacity
                key={folder._id}
                onPress={() =>
                  router.push(`/users/${id}/folders/${folder._id}`)
                }
                activeOpacity={0.8}
                className="border border-gray-400 w-full h-[4.5rem] rounded-lg flex-row items-center p-4"
              >
                <Image
                  className="w-80 h-80"
                  source={require("../../../assets/icons/Blue.png")}
                  style={{
                    width: 37,
                    height: 29,
                  }}
                />
                <View className="w-full">
                  <View className="flex-row w-full justify-around items-center">
                    <View className="w-80">
                      <Text className="font-semibold text-[1.1rem]">
                        {folder.name}{" "}
                        <Text className="text-[1.1rem] font-inter-regular">
                          {`( ${folder.files.length} )`}
                        </Text>
                      </Text>
                      <Text className="text-[0.9rem] text-neutral-700">
                        {`Created on ${formatISODate(folder.createdAt)}`}
                      </Text>
                    </View>
                    <View className="pr-5">
                      <RightIcon />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <NewFolderModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setFolderName("");
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
