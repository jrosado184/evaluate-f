import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { Alert, AlertText } from "@/components/ui/alert";
import Icon from "react-native-vector-icons/Octicons";

interface Props {
  message: string;
  clearMessage: () => void;
}

const SuccessModal = ({ message, clearMessage }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const visible = !!message?.trim();

  useEffect(() => {
    if (!visible) return;

    fadeAnim.setValue(0);

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
      }).start(() => clearMessage());
    }, 3000);

    return () => clearTimeout(timeout);
  }, [visible, message, fadeAnim, clearMessage]);

  if (!visible) return null;

  return (
    <View
      style={{
        zIndex: 9999,
        position: "absolute",
        bottom: 0,
        left: 20,
        right: 20,
      }}
      pointerEvents="none"
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Alert
          className="mb-48 w-full items-center justify-center bg-[#008000]"
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
