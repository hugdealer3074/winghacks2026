import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: '',
          headerStyle: { backgroundColor: '#f5f5f5' },
        }}
      />
    </Stack>
  );
}