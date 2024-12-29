import { View } from "react-native";
import React from "react";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Icon from "react-native-vector-icons/Feather";
import { useTabBar } from "@/app/(tabs)/_layout";

const Fab = ({ icon }: any) => {
  const { loading } = useEmployeeContext();
  const { isTabBarVisible } = useTabBar();
  return (
    <>
      {!loading && (
        <View
          className={`bg-[#1a237e] justify-center items-center absolute z-10 right-8 w-14 h-14 rounded-full shadow-sm ${
            isTabBarVisible ? "bottom-[10.5rem]" : "bottom-[7rem]"
          }`}
        >
          <Icon name={icon} size={19} color="white" />
        </View>
      )}
    </>
  );
};

export default Fab;
