import React from "react";
import { SVGIconTypes } from "@/types/global-types";
import Svg, { Path, Line } from "react-native-svg";

const FileTextIcon: React.FC<SVGIconTypes> = ({
  width = "100%",
  height = "100%",
  fillColor = "#FFFFFF",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 1024 1024" fill="none">
      {/* File Body */}
      <Path d="M534 352V136H224v752h576V352H534z" fill={fillColor} />
      {/* Folded Corner */}
      <Path d="M554 352V192l192 160H554z" fill={fillColor} />
      {/* Thin Handwriting Lines */}
      <Line
        x1="340"
        y1="520"
        x2="684"
        y2="520"
        stroke={"#ffff"}
        strokeWidth={30}
        strokeLinecap="round"
      />
      <Line
        x1="340"
        y1="520"
        x2="684"
        y2="520"
        stroke={"#ffff"}
        strokeWidth={30}
        strokeLinecap="round"
      />
      <Line
        x1="340"
        y1="712"
        x2="684"
        y2="712"
        stroke={"#ffff"}
        strokeWidth={30}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default FileTextIcon;
