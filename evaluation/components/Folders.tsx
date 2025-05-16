import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import React, { useRef, useEffect } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import useEmployeeContext from "@/app/context/EmployeeContext";
import RightIcon from "@/constants/icons/RightIcon";
import formatISODate from "@/app/conversions/ConvertIsoDate";
import Icon from "react-native-vector-icons/AntDesign";

interface FoldersProps {
  onDeleteFolder: (folderId: string) => void;
  onEditPress: (folderId: string, folderName: string) => void;
  onTapOutside?: () => void;
  registerCloseSwipeable?: (fn: () => void) => void;
}

const Folders = ({
  onDeleteFolder,
  onEditPress,
  onTapOutside,
  registerCloseSwipeable,
}: FoldersProps) => {
  const { employee } = useEmployeeContext();
  const { id } = useGlobalSearchParams();
  const openSwipeableRef = useRef<Swipeable | null>(null);

  const closeSwipeable = () => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close();
      openSwipeableRef.current = null;
    }
  };

  useEffect(() => {
    if (registerCloseSwipeable) {
      registerCloseSwipeable(closeSwipeable);
    }
  }, [registerCloseSwipeable]);

  const handleSwipeableWillOpen = (ref: Swipeable) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = ref;
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    folderId: string,
    folderName: string
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 8],
      extrapolate: "clamp",
    });
    // Edit and delete buttons
    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          flexDirection: "row",
          height: "100%",
          marginRight: 20,
          width: "33%",
          gap: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => onEditPress(folderId, folderName)}
          className="justify-center items-center w-20 h-full rounded-l-lg bg-blue-600"
        >
          <Text className="text-white font-inter-semibold text-sm">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert("Delete folder", "Are you sure?", [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => onTapOutside?.(),
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => onDeleteFolder(folderId),
              },
            ])
          }
          className="justify-center items-center w-20 h-full bg-red-500"
          style={{
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Text className="text-white font-inter-semibold text-sm">Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View className="gap-y-5 items-center w-full">
      {employee?.folders?.length === 0 ? (
        <View className="flex-col items-center justify-center mt-12 px-6">
          <Image
            source={require("../assets/icons/empty-folder.png")} // optional
            style={{ width: 60, height: 60, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text className="text-lg font-inter-semibold text-neutral-700">
            No folders yet
          </Text>
          <Text className="text-sm text-neutral-500 mt-1 text-center">
            Tap “New folder” above to add your first one.
          </Text>
        </View>
      ) : (
        employee?.folders?.map((folder: any) => {
          let swipeRef: Swipeable | null = null;

          return (
            <Swipeable
              key={folder._id}
              ref={(ref) => (swipeRef = ref)}
              onSwipeableWillOpen={() =>
                swipeRef && handleSwipeableWillOpen(swipeRef)
              }
              renderRightActions={(progress) =>
                renderRightActions(progress, folder._id, folder.name)
              }
              friction={2}
              overshootRight={false}
              rightThreshold={40}
              containerStyle={{ width: "100%" }}
            >
              <View className="w-full items-center bg-white">
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/users/${id}/folders/${folder._id}`)
                  }
                  activeOpacity={0.8}
                  className="w-[90vw] border border-gray-400 h-[4.5rem] rounded-lg flex-row items-center pl-4 pr-2 bg-white"
                >
                  <Icon
                    size={30}
                    name="folder1"
                    style={{
                      color: "#1a237e",
                    }}
                  />
                  <View className="w-full pl-3">
                    <View className="flex-row w-full justify-between items-center">
                      <View className="flex-1">
                        <Text className="font-semibold text-[1.1rem]">
                          {folder.name}
                          <Text className="text-[1.1rem] font-inter-regular">
                            {` ( ${folder.files.length} )`}
                          </Text>
                        </Text>
                        <Text className="text-[0.9rem] text-neutral-700">
                          {`Created on ${formatISODate(folder.createdAt)}`}
                        </Text>
                      </View>
                      <View className="pr-12 justify-center items-center">
                        <RightIcon />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </Swipeable>
          );
        })
      )}
    </View>
  );
};

export default Folders;
