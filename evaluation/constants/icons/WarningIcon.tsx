import React from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

const WarningIcon = () => {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <G clip-path="url(#clip0_109_927)">
        <Path
          d="M10 0C4.47768 0 0 4.47768 0 10C0 15.5223 4.47768 20 10 20C15.5223 20 20 15.5223 20 10C20 4.47768 15.5223 0 10 0ZM10 18.3036C5.41518 18.3036 1.69643 14.5848 1.69643 10C1.69643 5.41518 5.41518 1.69643 10 1.69643C14.5848 1.69643 18.3036 5.41518 18.3036 10C18.3036 14.5848 14.5848 18.3036 10 18.3036Z"
          fill="#FF0000"
        />
        <Path
          d="M8.92859 13.9286C8.92859 14.2127 9.04147 14.4853 9.2424 14.6862C9.44333 14.8871 9.71586 15 10 15C10.2842 15 10.5567 14.8871 10.7576 14.6862C10.9586 14.4853 11.0714 14.2127 11.0714 13.9286C11.0714 13.6444 10.9586 13.3719 10.7576 13.171C10.5567 12.97 10.2842 12.8571 10 12.8571C9.71586 12.8571 9.44333 12.97 9.2424 13.171C9.04147 13.3719 8.92859 13.6444 8.92859 13.9286ZM9.4643 11.4286H10.5357C10.6339 11.4286 10.7143 11.3482 10.7143 11.25V5.17857C10.7143 5.08036 10.6339 5 10.5357 5H9.4643C9.36609 5 9.28573 5.08036 9.28573 5.17857V11.25C9.28573 11.3482 9.36609 11.4286 9.4643 11.4286Z"
          fill="#FF0000"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_109_927">
          <Rect width="20" height="20" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default WarningIcon;