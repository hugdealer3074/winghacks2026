import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function AuthBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* base wash */}
      <LinearGradient
        colors={["#FBF9FF", "#F1EAFF", "#F7FBFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* big soft lavender “water” */}
      <LinearGradient
        colors={["rgba(160,131,249,0.55)", "rgba(160,131,249,0.00)"]}
        start={{ x: 0.2, y: 0.2 }}
        end={{ x: 0.9, y: 0.8 }}
        style={[styles.blob, styles.a]}
      />

      {/* deeper purple swirl */}
      <LinearGradient
        colors={["rgba(90,31,193,0.28)", "rgba(90,31,193,0.00)"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.blob, styles.b]}
      />

      {/* tiny sage hint (mother nature vibe) */}
      <LinearGradient
        colors={["rgba(167,199,161,0.18)", "rgba(167,199,161,0.00)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.blob, styles.c]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: "absolute", borderRadius: 999 },
  a: { width: 520, height: 520, top: -260, left: -180 },
  b: { width: 520, height: 520, bottom: -280, right: -220 },
  c: { width: 420, height: 420, top: 160, right: -240 },
});