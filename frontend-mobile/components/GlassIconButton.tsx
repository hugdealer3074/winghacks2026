import React from "react";
import { Pressable, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOW } from "../theme";

export function GlassIconButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <BlurView intensity={Platform.OS === "ios" ? 28 : 16} tint="light" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["rgba(160,131,249,0.18)", "rgba(167,199,161,0.10)", "rgba(255,255,255,0.10)"]}
        style={StyleSheet.absoluteFill}
      />
      <Ionicons name={icon} size={20} color={COLORS.lavenderDeep} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    ...SHADOW.soft,
  },
});