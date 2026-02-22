import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "../contexts/AuthContext";
import { generateAnonymousUsername } from "../utils/usernameGenerator";
import { COLORS, SPACING, RADIUS, SHADOW } from "../theme";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(width * 0.82, 340);

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  const slideAnim = useRef(new Animated.Value(-PANEL_W)).current;
  const router = useRouter();
  const { user, logout } = useAuth();

  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    if (visible) {
      if (!user && !guestName) setGuestName(generateAnonymousUsername());

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -PANEL_W,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, user]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          onClose();
          await logout();
          setGuestName("");
        },
      },
    ]);
  };

  const handleLogin = () => {
    onClose();
    router.push("/auth/login");
  };

  if (!visible) return null;

  const displayName = user ? user.anonymousUsername : guestName || "Guest User";
  const displayEmail = user ? user.email : "Browsing as Guest";
  const avatarLetter = displayName?.charAt(0)?.toUpperCase() || "?";

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        {/* Drawer */}
        <Animated.View
          style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Glass shell */}
          <View style={styles.glassShell}>
            <BlurView intensity={Platform.OS === "ios" ? 30 : 18} tint="light" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={[
                "rgba(160,131,249,0.20)",
                "rgba(167,199,161,0.14)",
                "rgba(255,255,255,0.22)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Header Row */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIconPill}>
                  <Ionicons name="sparkles" size={18} color={COLORS.lavenderDeep} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Ruma</Text>
                  <Text style={styles.headerSubtitle}>Your resource care buddy</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.9}>
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* User section */}
            <View style={styles.userCard}>
              <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.70)",
                  "rgba(222,210,255,0.22)",
                  "rgba(167,199,161,0.12)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.userTopRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{avatarLetter}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.username}>{displayName}</Text>

                    {!user && (
                      <TouchableOpacity
                        onPress={() => setGuestName(generateAnonymousUsername())}
                        style={styles.refreshButton}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="refresh" size={16} color={COLORS.lavenderDeep} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.userEmail}>{displayEmail}</Text>
                </View>
              </View>
            </View>

            {/* Menu items */}
            <View style={styles.menuList}>
              <MenuItem icon="settings-outline" label="Settings" onPress={() => {}} />
              <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
              <MenuItem icon="information-circle-outline" label="About" onPress={() => {}} />
            </View>

            {/* Auth button */}
            <View style={styles.authSection}>
              {user ? (
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.9}>
                  <Ionicons name="log-out-outline" size={18} color="white" />
                  <Text style={styles.authBtnText}>Logout</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.9}>
                  <Ionicons name="log-in-outline" size={18} color="white" />
                  <Text style={styles.authBtnText}>Login / Sign Up</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>GatorFamily v1.0</Text>
              <Text style={styles.footerSubtext}>Made with 💜 at WiNGHacks 2026</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

/** A single row in the menu */
function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.menuIconPill}>
        <Ionicons name={icon} size={18} color={COLORS.lavenderDeep} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="rgba(34,34,34,0.35)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 10, 0.35)", // softer than harsh black
  },

  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_W,
  },

  glassShell: {
    flex: 1,
    borderTopRightRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    overflow: "hidden",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.55)",
    paddingTop: Platform.OS === "ios" ? 54 : 34,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    ...SHADOW.soft,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconPill: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(222,210,255,0.70)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  userCard: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.soft,
  },

  userTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "rgba(160,131,249,0.90)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  username: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  refreshButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(222,210,255,0.60)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  userEmail: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },

  menuList: {
    gap: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.xl,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
  },

  menuIconPill: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(222,210,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  authSection: {
    marginTop: "auto",
    paddingTop: SPACING.lg,
  },

  loginBtn: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.lavenderDeep,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutBtn: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(239,68,68,0.92)",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  authBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
  },

  footer: {
    alignItems: "center",
    paddingTop: SPACING.lg,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(34,34,34,0.45)",
  },
  footerSubtext: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(34,34,34,0.35)",
    marginTop: 4,
    textAlign: "center",
  },
});