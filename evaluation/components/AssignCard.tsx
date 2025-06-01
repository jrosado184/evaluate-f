import { View, Text } from "react-native";
import React from "react";
import Gender from "react-native-vector-icons/MaterialIcons";
import CheckIcon from "@/constants/icons/CheckIcon";
import useEmployeeContext from "@/app/context/EmployeeContext";
import SinglePressTouchable from "@/app/utils/SinglePress";

interface AssignCardTypes {
  locker_number: string | undefined;
  location: string;
  onClose?: any;
}

const AssignCard: React.FC<AssignCardTypes> = ({
  locker_number,
  location,
  onClose,
}) => {
  const { setAddEmployeeInfo } = useEmployeeContext();

  const handleAssign = (close: any) => {
    setAddEmployeeInfo((prev: any) => ({
      ...prev,
      locker_number: locker_number,
    }));
    close();
  };

  return (
    <View className="h-28 w-[100%] my-2 flex-row justify-between p-4 py-1 border border-gray-400 rounded-lg">
      <View className="my-2 gap-1 flex-row justify-between w-full">
        <View className="w-[50%] gap-1">
          <Text className="font-inter-medium text-[1.2rem]">
            Locker:{" "}
            <Text className="font-inter-bold text-[1.2rem]">
              {locker_number}
            </Text>
          </Text>
          <Text className="font-inter-regular">{location}</Text>
        </View>
        <View className="justify-between items-end gap-4">
          <View className="flex-row gap-2 items-center">
            <Gender
              color={
                location.split(" ")[1] === "Womens" ? "#E91E63" : "#005FCC"
              }
              name={location.split(" ")[1] === "Mens" ? "male" : "female"}
              size={24}
            />
            <CheckIcon />
          </View>
          <SinglePressTouchable
            onPress={() => handleAssign(onClose)}
            activeOpacity={0.8}
            className="w-20 h-8 border border-gray-400 justify-center items-center rounded-md my-2"
          >
            <Text className="text-sm">Assign</Text>
          </SinglePressTouchable>
        </View>
      </View>
    </View>
  );
};

export default AssignCard;
