import { useEffect, useRef } from "react";
import { TouchableOpacity, Animated, Easing, StyleSheet } from "react-native";
import React from "react";
import useEmployeeContext from "@/app/context/EmployeeContext";
import Icon from "react-native-vector-icons/Feather";
import { useTabBar } from "@/app/(tabs)/_layout";
import { useRouter } from "expo-router";

const Fab = ({ icon, route }: any) => {
  const { loading } = useEmployeeContext();
  const { isTabBarVisible } = useTabBar();
  const router = useRouter();

  // Animated value for smooth bottom transition
  const bottomPosition = useRef(
    new Animated.Value(isTabBarVisible ? 150 : 82)
  ).current;

  //210, 142
  useEffect(() => {
    Animated.timing(bottomPosition, {
      toValue: isTabBarVisible ? 150 : 82, // Move up when tab bar is visible, move down when hidden
      duration: 145, // Smooth transition speed
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // `bottom` cannot use native driver
    }).start();
  }, [isTabBarVisible]);

  return (
    <>
      {!loading && (
        <Animated.View
          style={[styles.fabContainer, { bottom: bottomPosition }]}
        >
          <TouchableOpacity
            onPress={() => router.push(`/${route}`)}
            activeOpacity={0.8}
            style={styles.fabButton}
          >
            <Icon name={icon} size={19} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
};

export default Fab;

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    right: 28,
    zIndex: 999, // Keeps the FAB above everything
    elevation: 10, // Ensures visibility on Android
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1a237e",
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.2, // Reduced shadow intensity
    shadowRadius: 2, // Smaller shadow spread
    shadowOffset: { width: 0, height: 2 },
    elevation: 6, // Android-specific shadow control
  },
});
