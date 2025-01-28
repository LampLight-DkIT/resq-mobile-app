// app/(auth)/login.tsx
import axios from "axios";
import React, { useState } from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SvgUri } from "react-native-svg";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const API_URL = "http://192.168.1.26:3000";

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: email,
        password: password,
      });
  
      if (response.status === 200) {
        const { token, user } = response.data;
        // Store the token securely, e.g., using AsyncStorage
        // Navigate to home on successful login
        console.log('Login successful:', user);
        router.push('/(app)/home');
      }
    } catch (error: any) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred');

    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require("@/assets/images/start-background.png")}
          style={styles.bgImg}
          resizeMode='cover'
        >
          <SafeAreaView
            style={[
              styles.container,
              { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
            ]}
          >
            <StatusBar style={isDark ? "light" : "dark"} />
            <View style={styles.mainContainer}>
              <View style={styles.headerContainer}>
                <Image
                  source={require("@/assets/images/logo/resq-color.png")} // Adjust the path to your image
                  style={styles.logoImage}
                  resizeMode='cover'
                />
                <Text
                  style={[styles.title, { color: isDark ? "#fff" : "#000" }]}
                >
                  Welcome Back
                </Text>
                <Text
                  style={[styles.subtitle, { color: isDark ? "#ccc" : "#666" }]}
                >
                  Sign in to continue
                </Text>
              </View>

              <View style={styles.formContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#34495E" : "#fff",
                      color: isDark ? "#fff" : "#000",
                      borderColor: isDark ? "#455d7a" : "#ddd",
                    },
                  ]}
                  placeholder='Email'
                  placeholderTextColor={isDark ? "#95a5a6" : "#999"}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType='email-address'
                  autoCapitalize='none'
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#34495E" : "#fff",
                      color: isDark ? "#fff" : "#000",
                      borderColor: isDark ? "#455d7a" : "#ddd",
                    },
                  ]}
                  placeholder='Password'
                  placeholderTextColor={isDark ? "#95a5a6" : "#999"}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push("/(auth)/forgot-password")}
                >
                  <Text
                    style={[
                      styles.forgotPasswordText,
                      { color: isDark ? "#7f8c8d" : "#666" },
                    ]}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                  <Text
                    style={[
                      styles.signupText,
                      { color: isDark ? "#ccc" : "#666" },
                    ]}
                  >
                    Don't have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/signup")}
                  >
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImg: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "space-between",
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
    marginVertical: 20,
  },
  logoImage: {
    width: 230,
    height: 85,
    marginBottom: 20,
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontFamily: "TtNormsProMedium",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "TtNormsProRegular",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "TtNormsProRegular",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: "TtNormsProRegular",
  },
  buttonContainer: {
    width: "100%",
    marginTop: "auto",
    paddingTop: 20,
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
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
    fontFamily: "TtNormsProRegular",
    marginRight: 5,
  },
  signupLink: {
    fontSize: 16,
    fontFamily: "TtNormsProMedium",
    color: "#007bff",
  },
});
