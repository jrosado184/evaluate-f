import { useState } from "react";

const useSelect = (loadData?: any, toggleModal?: any, onSelect?: any) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handlePress = async () => {
    if (loadData) await loadData();
    if (toggleModal) {
      toggleModal();
    } else {
      setShowActionSheet(true);
    }
  };

  const handleSelect = (value: any) => {
    if (typeof value === "object" && value.position) {
      setSelectedValue(value.position);
      onSelect(value);
    } else {
      setSelectedValue(value);
      onSelect && onSelect(value);
    }
    setShowActionSheet(false);
  };
  const reset = () => {
    setSelectedValue(null); // Clear selected value
  };

  return {
    handlePress,
    handleSelect,
    showActionSheet,
    setShowActionSheet,
    selectedValue,
    setSelectedValue,
    reset,
  };
};

export default useSelect;
