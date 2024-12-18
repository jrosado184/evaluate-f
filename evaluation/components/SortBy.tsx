import React, { useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface CustomPickerProps {
  items: { label: string; value: string }[]; // Dropdown items
  value: string | null; // Current selected value
  onValueChange: (value: string) => void; // Callback for value change
  placeholder?: { label: string; value: string }; // Optional placeholder
  label?: string; // Optional label above the picker
}

const SortBy: React.FC<CustomPickerProps> = ({
  items,
  value,
  onValueChange,
  label,
}) => {
  const pickerRef = useRef<RNPickerSelect>(null);

  return (
    <View>
      <RNPickerSelect
        ref={pickerRef}
        onValueChange={onValueChange}
        items={items}
        value={value}
        useNativeAndroidPickerStyle={false}
        style={{
          inputIOS: styles.inputIOS,
          inputAndroid: styles.inputAndroid,
        }}
        Icon={() => null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  inputIOS: {
    width: "100%",
    flex: 1,
    fontSize: 12,
    color: "black",
    paddingVertical: 12,
    textAlign: "center",
  },
  inputAndroid: {
    flex: 1,
    fontSize: 16,
    color: "black",
    paddingVertical: 12,
    textAlign: "center",
  },
  iconContainer: {
    position: "absolute",
    right: 10,
  },
});

export default SortBy;
