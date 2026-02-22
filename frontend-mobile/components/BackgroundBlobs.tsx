import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../theme";

/**
 * BackgroundBlobs = decorative soft gradients behind a screen.
 * Put it as the FIRST child in a screen so it sits behind everything.
 */
export function BackgroundBlobs() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* big lavender glow */}
      <LinearGradient
        colors={["rgba(160,131,249,0.42)", "rgba(160,131,249,0.00)"]}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.7 }}
        style={[styles.blob, styles.blobA]}
      />

      {/* sage glow */}
      <LinearGradient
        colors={["rgba(167,199,161,0.34)", "rgba(167,199,161,0.00)"]}
        start={{ x: 0.1, y: 0.2 }}
        end={{ x: 0.9, y: 0.9 }}
        style={[styles.blob, styles.blobB]}
      />

      {/* subtle overall wash */}
      <LinearGradient
        colors={[COLORS.background, "rgba(222,210,255,0.15)", COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blobA: {
    width: 520,
    height: 520,
    top: -240,
    left: -160,
    transform: [{ rotate: "18deg" }],
  },
  blobB: {
    width: 480,
    height: 480,
    bottom: -260,
    right: -200,
    transform: [{ rotate: "-12deg" }],
  },
});