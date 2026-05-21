import { SVGIconTypes } from "@/types/global-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

const JSAIcon: React.FC<SVGIconTypes> = ({
  width = 24,
  height = 24,
  fillColor = "#9CA3AF",
}) => {
  const iconSize =
    typeof width === "number" && typeof height === "number"
      ? Math.min(width, height)
      : 24;

  return (
    <MaterialCommunityIcons
      name="shield-check-outline"
      size={32}
      color={fillColor}
    />
  );
};

export default JSAIcon;
