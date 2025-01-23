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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import EmergencyContactsTab from "../components/EmergencyContactsTab";
import { typography } from "@/styles/typography";
import { FONTS } from "@/constants/fonts";
import ChatListScreen from "./chat";

const Tab = createBottomTabNavigator();

const HomeScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation(); // Add this to access navigation

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

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
            { color: isDark ? "#fff" : "#000" },
          ]}
        >
          ResQ
        </Text>
        <View style={styles.appBarRight}>
          <Ionicons
            name='notifications-outline'
            size={24}
            color={isDark ? "#fff" : "#000"}
            style={styles.notificationIcon}
          />

          <Image
            source={{ uri: "https://i.pravatar.cc/150" }}
            style={styles.profileImage}
          />
        </View>
      </View>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = "chatbubbles-outline";

            if (route.name === "Chats") {
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
            } else if (route.name === "Emergency") {
              iconName = focused ? "alert-circle" : "alert-circle-outline";
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
        <Tab.Screen name='Emergency' options={{ title: "Emergency Contacts" }}>
          {() => <EmergencyContactsTab isDark={isDark} />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
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
  },
  tabContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
