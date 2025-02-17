import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Alert, AlertText } from "@/components/ui/alert";
import Icon from "react-native-vector-icons/Octicons";

const SuccessModal = ({
  isVisible,
}: {
  isVisible: boolean;
  message: string;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
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
  }, [isVisible]);

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
        className="mb-48 w-full border border-neutral-300 justify-center items-center"
        action="success"
        variant="solid"
      >
        <Icon name="check-circle" size={16} color="#28a745" />
        <AlertText className="font-inter-bold">{message}</AlertText>
      </Alert>
    </Animated.View>
  );
};

export default SuccessModal;
