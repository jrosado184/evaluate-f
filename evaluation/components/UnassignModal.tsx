// src/components/UnassignModal.tsx
import React, { useEffect } from "react";
import { Alert } from "react-native";

interface UnassignModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Native-style confirmation using Alert.alert.
 * Renders nothing visually; just triggers an alert whenever `visible` is true.
 */
const UnassignModal: React.FC<UnassignModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (!visible) return;

    Alert.alert(
      "Unassign Locker",
      "Are you sure you want to unassign this locker?",
      [
        { text: "Cancel", style: "cancel", onPress: onClose },
        {
          text: "Unassign",
          style: "destructive",
          onPress: () => {
            onConfirm();
            onClose(); // close flag after action
          },
        },
      ],
      { cancelable: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]); // run when `visible` toggles to true

  return null; // no UI needed
};

export default UnassignModal;
