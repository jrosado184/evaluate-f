import React from "react";
import { Svg, Path } from "react-native-svg";

const KeyboardIcon: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 35 35" fill="none">
      <Path
        d="M30.625 6.5625H4.375C3.79484 6.5625 3.23844 6.79297 2.8282 7.2032C2.41797 7.61344 2.1875 8.16984 2.1875 8.75V26.25C2.1875 26.8302 2.41797 27.3866 2.8282 27.7968C3.23844 28.207 3.79484 28.4375 4.375 28.4375H30.625C31.2052 28.4375 31.7616 28.207 32.1718 27.7968C32.582 27.3866 32.8125 26.8302 32.8125 26.25V8.75C32.8125 8.16984 32.582 7.61344 32.1718 7.2032C31.7616 6.79297 31.2052 6.5625 30.625 6.5625ZM30.625 26.25H4.375V8.75H30.625V26.25ZM28.4375 17.5C28.4375 17.7901 28.3223 18.0683 28.1171 18.2734C27.912 18.4785 27.6338 18.5938 27.3438 18.5938H7.65625C7.36617 18.5938 7.08797 18.4785 6.88285 18.2734C6.67773 18.0683 6.5625 17.7901 6.5625 17.5C6.5625 17.2099 6.67773 16.9317 6.88285 16.7266C7.08797 16.5215 7.36617 16.4062 7.65625 16.4062H27.3438C27.6338 16.4062 27.912 16.5215 28.1171 16.7266C28.3223 16.9317 28.4375 17.2099 28.4375 17.5ZM28.4375 13.125C28.4375 13.4151 28.3223 13.6933 28.1171 13.8984C27.912 14.1035 27.6338 14.2188 27.3438 14.2188H7.65625C7.36617 14.2188 7.08797 14.1035 6.88285 13.8984C6.67773 13.6933 6.5625 13.4151 6.5625 13.125C6.5625 12.8349 6.67773 12.5567 6.88285 12.3516C7.08797 12.1465 7.36617 12.0312 7.65625 12.0312H27.3438C27.6338 12.0312 27.912 12.1465 28.1171 12.3516C28.3223 12.5567 28.4375 12.8349 28.4375 13.125ZM9.84375 21.875C9.84375 22.1651 9.72852 22.4433 9.5234 22.6484C9.31828 22.8535 9.04008 22.9688 8.75 22.9688H7.65625C7.36617 22.9688 7.08797 22.8535 6.88285 22.6484C6.67773 22.4433 6.5625 22.1651 6.5625 21.875C6.5625 21.5849 6.67773 21.3067 6.88285 21.1016C7.08797 20.8965 7.36617 20.7812 7.65625 20.7812H8.75C9.04008 20.7812 9.31828 20.8965 9.5234 21.1016C9.72852 21.3067 9.84375 21.5849 9.84375 21.875ZM22.9688 21.875C22.9688 22.1651 22.8535 22.4433 22.6484 22.6484C22.4433 22.8535 22.1651 22.9688 21.875 22.9688H13.125C12.8349 22.9688 12.5567 22.8535 12.3516 22.6484C12.1465 22.4433 12.0312 22.1651 12.0312 21.875C12.0312 21.5849 12.1465 21.3067 12.3516 21.1016C12.5567 20.8965 12.8349 20.7812 13.125 20.7812H21.875C22.1651 20.7812 22.4433 20.8965 22.6484 21.1016C22.8535 21.3067 22.9688 21.5849 22.9688 21.875ZM28.4375 21.875C28.4375 22.1651 28.3223 22.4433 28.1171 22.6484C27.912 22.8535 27.6338 22.9688 27.3438 22.9688H26.25C25.9599 22.9688 25.6817 22.8535 25.4766 22.6484C25.2715 22.4433 25.1562 22.1651 25.1562 21.875C25.1562 21.5849 25.2715 21.3067 25.4766 21.1016C25.6817 20.8965 25.9599 20.7812 26.25 20.7812H27.3438C27.6338 20.7812 27.912 20.8965 28.1171 21.1016C28.3223 21.3067 28.4375 21.5849 28.4375 21.875Z"
        fill="#091057"
        fill-opacity="0.8"
      />
    </Svg>
  );
};

export default KeyboardIcon;
