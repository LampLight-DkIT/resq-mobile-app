// app/(auth)/forgot-password.tsx
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
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (email.trim() === "") {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Check Your Email",
        "If an account exists for this email, you will receive password reset instructions.",
        [
          {
            text: "OK",
            onPress: () => router.push("/login"),
          },
        ]
      );
    } catch (error) {
      console.error("Password reset error:", error);
      // Don't expose if the email exists or not for security reasons
      Alert.alert(
        "Check Your Email",
        "If an account exists for this email, you will receive password reset instructions."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                source={require("@/assets/images/logo/resq-color.png")}
                style={styles.logoImage}
                resizeMode='cover'
              />
              <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
                Reset Password
              </Text>
              <Text
                style={[styles.subtitle, { color: isDark ? "#ccc" : "#666" }]}
              >
                Enter your email address to receive password reset instructions
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
                autoComplete='email'
                editable={!loading}
              />
            </View>

            <View style={styles.buttonContainer}>
              {loading ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator size='small' color='#ffffff' />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleResetPassword}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.backButtonText,
                    { color: isDark ? "#ccc" : "#666" },
                  ]}
                >
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

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
    paddingHorizontal: 20,
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
  loadingButton: {
    width: "100%",
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "TtNormsProMedium",
    fontSize: 18,
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "TtNormsProRegular",
    textAlign: "center",
  },
});
