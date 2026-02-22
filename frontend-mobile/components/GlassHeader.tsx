import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, RADIUS, SHADOW, SPACING } from "../theme";

export function GlassHeader({ title }: { title: string }) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.shell}>
        <BlurView intensity={Platform.OS === "ios" ? 28 : 16} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={["rgba(160,131,249,0.18)", "rgba(167,199,161,0.12)", "rgba(255,255,255,0.12)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  shell: {
    width: "92%",
    height: 52,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    ...SHADOW.soft,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
});