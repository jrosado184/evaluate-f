import { SVGIconTypes } from "@/types/global-types";
import React from "react";
import Svg, { Path } from "react-native-svg";

const LockIcon: React.FC<SVGIconTypes> = ({
  width = "100%",
  height = "100%",
  fillColor = "#FFFFFF",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 29 32">
      <Path
        d="M22.993 9.114h-3.729V6.352a5.49 5.49 0 0 0-1.638-3.906A5.631 5.631 0 0 0 13.671.829a5.63 5.63 0 0 0-3.954 1.617 5.49 5.49 0 0 0-1.638 3.906v2.762H4.35c-.494 0-.969.194-1.318.54-.35.345-.546.813-.546 1.302v12.889c0 .488.196.956.546 1.301.349.346.824.54 1.318.54h18.643c.494 0 .969-.194 1.318-.54.35-.345.546-.813.546-1.301V10.956c0-.489-.196-.957-.546-1.302a1.873 1.873 0 0 0-1.318-.54ZM9.943 6.352c0-.976.393-1.913 1.092-2.604a3.754 3.754 0 0 1 2.636-1.078c.989 0 1.938.388 2.637 1.078A3.663 3.663 0 0 1 17.4 6.352v2.762H9.943V6.352Zm13.05 17.493H4.35V10.956h18.643v12.889Z"
        fill={fillColor}
      />
      <Path
        d="M4.461 11.047h18.522v12.765H4.461z"
        transform="matrix(1.01003 0 0 1.01394 -.185 -.298)"
        fill={fillColor}
      />
    </Svg>
  );
};

export default LockIcon;
