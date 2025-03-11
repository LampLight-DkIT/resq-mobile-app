import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { View, ActivityIndicator } from "react-native";

export default function AuthLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, redirect to home
        router.replace("/(app)/home");
      } else {
        // No user, stay on login/signup screens
        router.replace("/(auth)/login");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size='large' color='#007bff' />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name='welcome' />
      <Stack.Screen name='login' />
      <Stack.Screen name='signup' />
      <Stack.Screen name='verify' />
      <Stack.Screen name='forgot-password' />
    </Stack>
  );
}
