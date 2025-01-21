// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    "TtNormsProNormal": require("../assets/fonts/TT Norms Pro Light.otf"),
    "TtNormsProRegular": require("../assets/fonts/TT Norms Pro Regular.otf"),
    "TtNormsProMedium": require("../assets/fonts/TT Norms Pro Medium.otf"),
    "TtNormsProMediumItalic": require("../assets/fonts/TT Norms Pro Medium Italic.otf"),
  });

  // Prevent the splash screen from auto-hiding before asset loading is complete.
  useEffect(() => {
    if (error) {
      console.error("Error loading fonts:", error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen 
          name="(auth)" 
          options={{ gestureEnabled: false }} 
        />
        <Stack.Screen 
          name="(app)" 
          options={{ gestureEnabled: false }} 
        />
      </Stack>
    </ThemeProvider>
  );
}