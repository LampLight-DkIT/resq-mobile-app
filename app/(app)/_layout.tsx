// app/(app)/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { auth } from "@/firebaseConfig";
import { Redirect } from "expo-router";

export default function AppLayout() {
  // Check if user is authenticated
  const user = auth.currentUser;

  // If not authenticated, redirect to login
  if (!user) {
    return <Redirect href='/(auth)/login' />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='UserListScreen' />
      <Stack.Screen name='EmergencyAlertScreen' />
      <Stack.Screen name='emergency-contacts' />
      <Stack.Screen name='add-emergency-contact' />
      <Stack.Screen name='chat-list-screen' />
      <Stack.Screen name='profile-screen' />
      <Stack.Screen name='notification-screen' />
      <Stack.Screen name='SettingsScreen' />
      <Stack.Screen name='chat-screen' />
      <Stack.Screen name='ChatDetailScreen' />
    </Stack>
  );
}
