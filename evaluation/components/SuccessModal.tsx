import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Alert, AlertText } from "@/components/ui/alert";
import Icon from "react-native-vector-icons/Octicons";
import useEmployeeContext from "@/app/context/EmployeeContext";

const SuccessModal = ({ message }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { successfullyAddedEmployee } = useEmployeeContext();

  useEffect(() => {
    if (successfullyAddedEmployee) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 3000);
    }
  }, [successfullyAddedEmployee]);

  return (
    <Animated.View
      className="w-full"
      style={{
        opacity: fadeAnim,
        zIndex: 9999,
        position: "absolute",
        bottom: 0,
        left: 20,
      }}
    >
      <Alert
        className="mb-48 w-full bg-[#008000] justify-center items-center"
        action="success"
        variant="solid"
      >
        <Icon name="check-circle" size={16} color="#ffffff" />
        <AlertText className="font-inter-bold text-neutral-50">
          {message}
        </AlertText>
      </Alert>
    </Animated.View>
  );
};

export default SuccessModal;
