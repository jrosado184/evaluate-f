import { TouchableOpacity, View } from "react-native";
import React from "react";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Icon from "react-native-vector-icons/Feather";
import { useTabBar } from "@/app/(tabs)/_layout";
import { useRouter } from "expo-router";

const Fab = ({ icon, route }: any) => {
  const { loading } = useEmployeeContext();
  const { isTabBarVisible } = useTabBar();
  const router = useRouter();
  return (
    <>
      {!loading && (
        <TouchableOpacity
          onPress={() => router.push(`/${route}`)}
          activeOpacity={0.8}
          className={`bg-[#1a237e] justify-center items-center absolute z-10 right-7 w-14 h-14 rounded-full shadow-sm ${
            isTabBarVisible ? "bottom-[10.5rem]" : "bottom-[7rem]"
          }`}
        >
          <Icon name={icon} size={19} color="white" />
        </TouchableOpacity>
      )}
    </>
  );
};

export default Fab;
