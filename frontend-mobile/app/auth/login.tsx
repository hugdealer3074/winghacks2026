import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "@/contexts/AuthContext";
import { AuthBackground } from "@/components/AuthBackground";
import { COLORS, RADIUS, SPACING, SHADOW } from "@/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login, signup } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        Alert.alert("Welcome back! 👋", "Successfully logged in", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        await signup(email, password);
        Alert.alert("Account Created! 🎉", "Your anonymous username has been generated", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <AuthBackground />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Main glass card */}
        <View style={styles.card}>
          <BlurView intensity={26} tint="light" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={["rgba(255,255,255,0.70)", "rgba(222,210,255,0.18)", "rgba(167,199,161,0.10)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Logo / title */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🌿</Text>
            <Text style={styles.appTitle}>Ruma</Text>
            <Text style={styles.appTagline}>24/7 Support for caretakers</Text>
          </View>

          {/* Toggle */}
          <View style={styles.toggleShell}>
            <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={["rgba(255,255,255,0.55)", "rgba(222,210,255,0.10)"]}
              style={StyleSheet.absoluteFill}
            />

            <TouchableOpacity
              style={[styles.toggleTab, isLogin && styles.toggleActive]}
              onPress={() => setIsLogin(true)}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleTab, !isLogin && styles.toggleActive]}
              onPress={() => setIsLogin(false)}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          <View style={styles.inputWrap}>
            <Ionicons name="mail" size={18} color={COLORS.lavenderDeep} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed" size={18} color={COLORS.lavenderDeep} />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 characters)"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {!isLogin && (
            <View style={styles.infoBox}>
              <BlurView intensity={14} tint="light" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={["rgba(222,210,255,0.35)", "rgba(167,199,161,0.15)"]}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="shield-checkmark" size={18} color={COLORS.lavenderDeep} />
              <Text style={styles.infoText}>You’ll get a fun anonymous username like “HappyPanda42”</Text>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["rgba(90,31,193,0.90)", "rgba(160,131,249,0.85)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{isLogin ? "Login" : "Create Account"}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={loading}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: SPACING.xl },

  card: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    padding: SPACING.xl,
    ...SHADOW.soft,
  },

  logoContainer: { alignItems: "center", marginBottom: SPACING.xl },
  logoEmoji: { fontSize: 48, marginBottom: 10 },
  appTitle: { fontSize: 34, fontWeight: "900", color: COLORS.lavenderDeep },
  appTagline: { marginTop: 6, fontSize: 14, fontWeight: "600", color: COLORS.textMuted },

  toggleShell: {
    flexDirection: "row",
    borderRadius: RADIUS.pill,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    marginBottom: SPACING.lg,
  },
  toggleTab: { flex: 1, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  toggleActive: { backgroundColor: "rgba(255,255,255,0.45)" },
  toggleText: { fontSize: 15, fontWeight: "700", color: COLORS.textMuted },
  toggleTextActive: { color: COLORS.lavenderDeep },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.70)",
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(34,34,34,0.08)",
    marginBottom: SPACING.md,
  },
  input: { flex: 1, fontSize: 16, color: COLORS.text },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    marginBottom: SPACING.md,
  },
  infoText: { flex: 1, fontSize: 13, fontWeight: "700", color: COLORS.lavenderDeep },

  button: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "white", fontSize: 17, fontWeight: "900" },

  backButton: { marginTop: SPACING.lg, alignItems: "center" },
  backButtonText: { color: COLORS.lavenderDeep, fontSize: 16, fontWeight: "800" },
});