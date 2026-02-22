import { Stack } from "expo-router";

export default function ForumLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ✅ remove purple banner header completely
      }}
    />
  );
}