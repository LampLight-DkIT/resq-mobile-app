// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StatusBar } from 'react-native';

export {
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

const FONTS = {
  TtNormsProNormal: require("@/assets/fonts/TT Norms Pro Light.otf"),
  TtNormsProRegular: require("@/assets/fonts/TT Norms Pro Regular.otf"),
  TtNormsProMedium: require("@/assets/fonts/TT Norms Pro Medium.otf"),
  TtNormsProMediumItalic: require("@/assets/fonts/TT Norms Pro Medium Italic.otf"),
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [loaded, error] = useFonts(FONTS);

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar 
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { 
              paddingTop: StatusBar.currentHeight,
            },
          }}
        >
          {/* <Stack.Screen name="(auth)" /> */}
          {/* <Stack.Screen name="(app)" /> */}
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="chat-screen" />
      <Stack.Screen name="chat-list-screen" />
      <Stack.Screen name="ChatDetailScreen" />
      <Stack.Screen name="profile-screen" />
      <Stack.Screen name="notification-screen" />
      <Stack.Screen name="emergency-contacts" />
      <Stack.Screen name="add-emergency-contact" />
    </Stack>
  );
}