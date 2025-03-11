import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth"; // ✅ Import User type
import * as SplashScreen from "expo-splash-screen";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null); // ✅ Type correctly
  const [authLoading, setAuthLoading] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    TtNormsProNormal: require("@/assets/fonts/TT Norms Pro Light.otf"),
    TtNormsProRegular: require("@/assets/fonts/TT Norms Pro Regular.otf"),
    TtNormsProMedium: require("@/assets/fonts/TT Norms Pro Medium.otf"),
    TtNormsProMediumItalic: require("@/assets/fonts/TT Norms Pro Medium Italic.otf"),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user); // ✅ No more TypeScript error
      setAuthLoading(false);
      console.log("Current user:", user?.uid ?? "Not logged in");
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !fontError) {
      SplashScreen.hideAsync();
    }
    if (fontError) {
      console.error("Font loading error:", fontError);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{!fontsLoaded ? "Loading fonts..." : "Checking auth..."}</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="(app)" options={{ gestureEnabled: false }} />
        ) : (
          <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        )}
      </Stack>
    </ThemeProvider>
  );
}
