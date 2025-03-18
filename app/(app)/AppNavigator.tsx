import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  useNavigation,
  NavigationProp,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { typography } from "@/styles/typography";
import { FONTS } from "@/constants/fonts";

// Import screens
import ChatListScreen from "./chat-list-screen";
import UserListScreen from "./UserListScreen";
import EmergencyAlertScreen from "./EmergencyAlertScreen";
import EmergencyContactsScreen from "./emergency-contacts";
import NotificationScreen from "./notification-screen";
import ProfileScreen from "./profile-screen";
import ChatDetailScreen from "./ChatDetailScreen";
import SettingsScreen from "./SettingsScreen";

// Define the types for Stack Navigator
export type RootStackParamList = {
  Home: undefined;
  Notifications: undefined;
  Profile: undefined;
  Chat: { name: string };
  ChatDetail: { userId: string; name: string; photoURL?: string };
  Settings: undefined;
};

// Create Stack Navigator with types
const Stack = createStackNavigator<RootStackParamList>();

// Define the types for Tab Navigator
type TabParamList = {
  Chats: undefined;
  Users: undefined;
  Emergency: undefined;
  EmergencyAlert: undefined;
};

// Create Tab Navigator with types
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Home">>();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* App Bar */}
      {route.name === "Home" && (
        <View
          style={[
            styles.appBar,
            { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
          ]}
        >
          <Text
            style={[
              styles.appTitle,
              typography.h2,
              { color: isDark ? "#fff" : "#000", fontFamily: FONTS.regular },
            ]}
          >
            ResQ
          </Text>
          <View style={styles.appBarRight}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons
                name='notifications-outline'
                size={24}
                color={isDark ? "#fff" : "#000"}
                style={styles.notificationIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150" }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Tabs */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === "Chats") {
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
            } else if (route.name === "Users") {
              iconName = focused ? "people" : "people-outline";
            } else if (route.name === "Emergency") {
              iconName = focused ? "people" : "people-outline";
            } else if (route.name === "EmergencyAlert") {
              iconName = focused ? "warning" : "warning-outline";
            } else {
              iconName = "chatbubbles-outline"; // Fallback value
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: isDark ? "#2C3E50" : "#fff",
            borderTopColor: isDark ? "#455d7a" : "#ddd",
          },
          tabBarActiveTintColor: "#007bff",
          tabBarInactiveTintColor: isDark ? "#95a5a6" : "#666",
          headerShown: false,
          tabBarLabelStyle: typography.caption,
        })}
      >
        <Tab.Screen name='Chats' component={ChatListScreen} />
        <Tab.Screen name='Users' component={UserListScreen} />
        <Tab.Screen
          name='Emergency'
          component={EmergencyContactsScreen}
          options={{ title: "Contacts" }}
        />
        <Tab.Screen
          name='EmergencyAlert'
          component={EmergencyAlertScreen}
          options={{
            title: "Alert",
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialIcons
                name={focused ? "warning" : "warning-amber"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='Home'
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='Notifications'
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='Profile'
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='ChatDetail'
        component={ChatDetailScreen}
        options={({ route }) => ({
          title: route.params.name,
        })}
      />
      <Stack.Screen
        name='Settings'
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  appBarRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    marginRight: 16,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  appTitle: {
    fontFamily: FONTS.medium,
    fontSize: 20,
  },
});

export default AppNavigator;
