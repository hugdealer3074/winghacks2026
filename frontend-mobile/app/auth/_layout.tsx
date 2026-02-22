import { Stack } from "expo-router";
import { Platform } from "react-native";
import { COLORS } from "../../theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: true,
        headerTitle: "",
        headerTransparent: true, // IMPORTANT: lets our gradient show through
        headerShadowVisible: false, // removes iOS bottom line
        headerTintColor: COLORS.lavenderDeep,
        contentStyle: { backgroundColor: COLORS.background }, // fallback color
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}