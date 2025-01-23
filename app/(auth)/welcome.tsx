import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Add font test elements
  const testFonts = [
    { name: "Default (System Font)", family: undefined },
    { name: "TtNormsProNormal", family: "TtNormsProNormal" },
    { name: "TtNormsProRegular", family: "TtNormsProRegular" },
    { name: "TtNormsProMedium", family: "TtNormsProMedium" },
    { name: "TtNormsProMediumItalic", family: "TtNormsProMediumItalic" },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.mainContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            Quick. Discreet. Life-Saving.
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#ccc" : "#666" }]}>
            Connect with emergency services discreetly and share critical
            information instantly.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    width: "100%",
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: "TtNormsProMediumItalic",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "TtNormsProRegular",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "TtNormsProMedium",
    fontSize: 18,
    textAlign: "center",
  },
  fontTest: {
    marginTop: 20,
    padding: 10,
    width: "100%",
  },
  fontTestText: {
    fontSize: 14,
    marginBottom: 10,
  },
});

export default WelcomeScreen;
