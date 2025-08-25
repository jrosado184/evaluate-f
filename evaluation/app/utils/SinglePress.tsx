import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  GestureResponderEvent,
} from "react-native";

type SinglePressProps = TouchableOpacityProps & {
  /** Minimum ms between taps to count as a new press */
  minInterval?: number;
  /** If true, disable further presses until onPress resolves */
  lockDuringPress?: boolean;
};

const SinglePressTouchable: React.FC<SinglePressProps> = ({
  onPress,
  disabled,
  minInterval = 400,
  lockDuringPress = true,
  ...props
}) => {
  const lastPressRef = useRef(0);
  const lockRef = useRef(false);
  const [internalDisabled, setInternalDisabled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePress = useCallback(
    async (e: GestureResponderEvent) => {
      const now = Date.now();

      // hard block if we're currently locked (e.g., async onPress still running)
      if (lockRef.current) return;

      // debounce: ignore presses within minInterval
      if (now - lastPressRef.current < minInterval) return;
      lastPressRef.current = now;

      if (lockDuringPress) {
        lockRef.current = true;
        setInternalDisabled(true);
        try {
          await onPress?.(e);
        } finally {
          // small cooldown to catch ultra-fast double taps
          timerRef.current = setTimeout(() => {
            lockRef.current = false;
            setInternalDisabled(false);
          }, minInterval);
        }
      } else {
        // no async lock, but still debounce for minInterval
        onPress?.(e);
        lockRef.current = true;
        timerRef.current = setTimeout(() => {
          lockRef.current = false;
        }, minInterval);
      }
    },
    [onPress, minInterval, lockDuringPress]
  );

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      disabled={disabled || internalDisabled}
    />
  );
};

export default SinglePressTouchable;
