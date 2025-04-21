import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useRef } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import formatISODate from "@/app/conversions/ConvertIsoDate";
import RightIcon from "@/constants/icons/RightIcon";
import useEmployeeContext from "@/app/context/EmployeeContext";
import { Swipeable } from "react-native-gesture-handler";

interface FoldersProps {
  onDeleteFolder: (folderId: string) => void;
  onTapOutside?: () => void; // Optional external handler (for modal cancel)
  handleModalCancel: any;
}

const Folders = ({
  onDeleteFolder,
  onTapOutside,
  handleModalCancel,
}: FoldersProps) => {
  const { employee } = useEmployeeContext();
  const { id } = useGlobalSearchParams();

  const openSwipeableRef = useRef<Swipeable | null>(null);

  const closeOpenSwipeable = () => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close();
      openSwipeableRef.current = null;
    }
  };

  const handleSwipeableWillOpen = (ref: Swipeable) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = ref;
  };

  const handleOutsideTap = () => {
    closeOpenSwipeable();
    onTapOutside?.(); // Call parent handler if provided (modal cancel case)
    Keyboard.dismiss();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    folderId: string
  ) => {
    const opacity = progress.interpolate({
      inputRange: [0.3, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={{ opacity }}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Delete folder", "Are you sure?", [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => handleModalCancel(),
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => onDeleteFolder(folderId),
              },
            ])
          }
          style={{
            backgroundColor: "#ef4444",
            justifyContent: "center",
            alignItems: "center",
            width: 80,
            height: "100%",
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsideTap}>
      <View className="w-full px-3 my-4 gap-y-4">
        {employee?.folders.map((folder: any) => {
          let swipeRef: Swipeable | null = null;

          return (
            <View
              key={folder._id}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <Swipeable
                ref={(ref) => (swipeRef = ref)}
                onSwipeableWillOpen={() =>
                  swipeRef && handleSwipeableWillOpen(swipeRef)
                }
                renderRightActions={(progress) =>
                  renderRightActions(progress, folder._id)
                }
                friction={2}
                overshootRight={false}
                rightThreshold={40}
              >
                <View className="items-center w-full">
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/users/${id}/folders/${folder._id}`)
                    }
                    activeOpacity={0.8}
                    className="w-[90vw] flex-row items-center p-4 border border-gray-400 bg-white"
                    style={{
                      borderRadius: 8,
                    }}
                  >
                    <Image
                      source={require("../assets/icons/Blue.png")}
                      style={{ width: 37, height: 29 }}
                    />
                    <View className="flex-1 pl-3">
                      <View className="flex-row justify-between items-center w-full">
                        <View className="flex-1">
                          <Text className="font-semibold text-[1.1rem]">
                            {folder.name}
                            <Text className="text-[1.1rem] font-inter-regular">
                              {` ( ${folder.files.length} )`}
                            </Text>
                          </Text>
                          <Text className="text-[0.9rem] text-neutral-700 mt-1">
                            {`Created on ${formatISODate(folder.createdAt)}`}
                          </Text>
                        </View>
                        <View className="ml-8 w-16 items-end">
                          <RightIcon />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </Swipeable>
            </View>
          );
        })}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Folders;
