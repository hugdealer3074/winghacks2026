import React from "react";
import { View, Pressable, StyleSheet, Platform, Text } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";

const COLORS = {
  lavender: "#A083F9",
  lavenderDeep: "#5A1FC1",
  lavenderSoft: "#DED2FF",
  sage: "#A7C7A1",
  background: "#FFFBF9",
  text: "#222222",
};

export function GlassTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.shell}>
        {/* Blur layer */}
        <BlurView
          intensity={Platform.OS === "ios" ? 28 : 16}
          tint="light"
          style={StyleSheet.absoluteFill}
        />

        {/* Gradient tint layer */}
        <LinearGradient
          colors={[
            "rgba(160,131,249,0.22)",
            "rgba(167,199,161,0.14)",
            "rgba(255,251,249,0.35)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Buttons */}
        <View style={styles.row}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Map your route -> icon
            const iconName =
              route.name === "index"
                ? "map"
                : route.name === "essentials"
                ? "cart"
                : route.name === "forum"
                ? "people"
                : "chatbubbles";

            const label =
              route.name === "index"
                ? "Map"
                : route.name === "essentials"
                ? "Essentials"
                : route.name === "forum"
                ? "Forum"
                : "AI Chat";

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.item}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
              >
                <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
                  <Ionicons
                    name={iconName as any}
                    size={22}
                    color={isFocused ? COLORS.lavenderDeep : "rgba(34,34,34,0.45)"}
                  />
                </View>

                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.OS === "ios" ? 18 : 14,
    alignItems: "center",
  },
  shell: {
    width: "92%",
    height: Platform.OS === "ios" ? 76 : 70,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  row: {
    flex: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  item: {
    width: 74,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPillActive: {
    backgroundColor: "rgba(222,210,255,0.65)",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(34,34,34,0.42)",
  },
  labelActive: {
    color: COLORS.lavenderDeep,
  },
});