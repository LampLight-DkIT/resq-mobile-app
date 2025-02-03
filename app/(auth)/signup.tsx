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
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import axios from "axios";

const SignupScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    };

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Validate phone number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(`${process.env.API_URL}/auth/register`, {
        username: formData.email,
        password: formData.password,
        firstName: formData.fullName.split(" ")[0],
        lastName: formData.fullName.split(" ")[1],
        phoneNumber: formData.phoneNumber
      });

      if (response.status === 201) {
        // Registration successful
        Alert.alert('Success', 'Registration successful! Please verify your email.');
        router.push('/(auth)/verify');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred');
      }
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
                source={require("@/assets/images/logo/resq-color.png")} // Adjust the path to your image
                style={styles.logoImage}
                resizeMode='cover'
              />
              <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
                Create Account
              </Text>
              <Text
                style={[styles.subtitle, { color: isDark ? "#ccc" : "#666" }]}
              >
                Sign up to get started
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#34495E" : "#fff",
                      color: isDark ? "#fff" : "#000",
                      borderColor: errors.fullName
                        ? "#ff4444"
                        : isDark
                        ? "#455d7a"
                        : "#ddd",
                    },
                  ]}
                  placeholder='Full Name'
                  placeholderTextColor={isDark ? "#95a5a6" : "#999"}
                  value={formData.fullName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fullName: text })
                  }
                  autoCapitalize='words'
                />
                {errors.fullName ? (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#34495E" : "#fff",
                      color: isDark ? "#fff" : "#000",
                      borderColor: errors.email
                        ? "#ff4444"
                        : isDark
                        ? "#455d7a"
                        : "#ddd",
                    },
                  ]}
                  placeholder='Email'
                  placeholderTextColor={isDark ? "#95a5a6" : "#999"}
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoComplete='email'
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#34495E" : "#fff",
                      color: isDark ? "#fff" : "#000",
                      borderColor: errors.password
                        ? "#ff4444"
                        : isDark
                        ? "#455d7a"
                        : "#ddd",
                    },
                  ]}
                  placeholder='Password'
                  placeholderTextColor={isDark ? "#95a5a6" : "#999"}
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry
                />
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#34495E" : "#fff",
                      color: isDark ? "#fff" : "#000",
                      borderColor: errors.confirmPassword
                        ? "#ff4444"
                        : isDark
                        ? "#455d7a"
                        : "#ddd",
                    },
                  ]}
                  placeholder='Confirm Password'
                  placeholderTextColor={isDark ? "#95a5a6" : "#999"}
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                  secureTextEntry
                />
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#34495E" : "#fff",
                      color: isDark ? "#fff" : "#000",
                      borderColor: errors.phoneNumber
                        ? "#ff4444"
                        : isDark
                        ? "#455d7a"
                        : "#ddd",
                    },
                  ]}
                  placeholder='Phone Number'
                  placeholderTextColor={isDark ? "#95a5a6" : "#999"}
                  value={formData.phoneNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phoneNumber: text })
                  }
                  keyboardType='phone-pad'
                />
                {errors.phoneNumber ? (
                  <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSignup}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text
                  style={[
                    styles.loginText,
                    { color: isDark ? "#ccc" : "#666" },
                  ]}
                >
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  headerContainer: {
    marginTop: 40,
    marginBottom: 20,
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
  formContainer: {
    width: "100%",
    marginVertical: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "TtNormsProRegular",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    fontFamily: "TtNormsProRegular",
    marginTop: 4,
    marginLeft: 4,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    fontFamily: "TtNormsProRegular",
    marginRight: 5,
  },
  loginLink: {
    fontSize: 16,
    fontFamily: "TtNormsProMedium",
    color: "#007bff",
  },
});

export default SignupScreen;
