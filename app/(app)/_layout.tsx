// app/(app)/_layout.tsx
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen 
        name="home"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}