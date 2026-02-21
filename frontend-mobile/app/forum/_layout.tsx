import { Stack } from 'expo-router';

export default function ForumLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#8B5CF6' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="post"
        options={{ title: 'Post' }}
      />
      <Stack.Screen 
        name="create"
        options={{ title: 'Ask a Question' }}
      />
    </Stack>
  );
}
