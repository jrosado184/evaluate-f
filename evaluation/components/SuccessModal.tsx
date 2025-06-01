import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { Alert, AlertText } from "@/components/ui/alert";
import Icon from "react-native-vector-icons/Octicons";

interface Props {
  message: string;
  trigger?: number;
  clearMessage?: () => void;
}

const SuccessModal = ({ message, trigger, clearMessage }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        clearMessage && clearMessage();
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [trigger]);

  if (!message) return null;

  return (
    <View
      style={{
        zIndex: 9999,
        position: "absolute",
        bottom: 0,
        left: 20,
        width: "100%",
      }}
    >
      <Animated.View
        className="w-full"
        style={{
          opacity: fadeAnim,
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
    </View>
  );
};

export default SuccessModal;
