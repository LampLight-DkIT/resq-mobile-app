import React, { useState, useRef, useEffect } from 'react';
import {
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import axios from 'axios';

const CODE_LENGTH = 6;

const VerifyScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { email: routeEmail } = useLocalSearchParams();
  
  // Create refs for each input field
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (routeEmail) {
      setEmail(String(routeEmail));
    }
  }, [routeEmail]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer, canResend]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move to next input if value is entered
    if (text.length === 1 && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input if backspace is pressed
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !code[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    try {
      await axios.post(`${process.env.API_URL}/auth/resend-code`, { email });
      setTimer(30);
      setCanResend(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code');
    }
  };

  const handleVerify = async () => {
    try {
      const verificationCode = code.join('');
      const response = await axios.post(`${process.env.API_URL}/auth/verify`, {
        email: email,
        verificationCode: verificationCode
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Email verified successfully!');
        router.push('/(auth)/login');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Verification Failed', error.response?.data?.message || 'An error occurred');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: isDark ? '#2C3E50' : '#f5f5f5' },
          ]}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <View style={styles.mainContainer}>
            <View style={styles.headerContainer}>
              <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
                Verify Your Email
              </Text>
              <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>
                Please enter the 6-digit code sent to your email address
              </Text>
            </View>

            <View style={styles.codeContainer}>
              {Array(CODE_LENGTH).fill(0).map((_, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => inputRefs.current[index] = ref}
                  style={[
                    styles.codeInput,
                    { 
                      backgroundColor: isDark ? '#34495E' : '#fff',
                      color: isDark ? '#fff' : '#000',
                      borderColor: isDark ? '#455d7a' : '#ddd'
                    },
                  ]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={code[index]}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  autoComplete="off"
                />
              ))}
            </View>

            <View style={styles.resendContainer}>
              <TouchableOpacity 
                onPress={handleResendCode}
                disabled={!canResend}>
                <Text 
                  style={[
                    styles.resendText,
                    { 
                      color: canResend 
                        ? '#007bff' 
                        : (isDark ? '#7f8c8d' : '#999')
                    }
                  ]}>
                  {canResend 
                    ? 'Resend Code' 
                    : `Resend code in ${timer}s`}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleVerify}
                activeOpacity={0.8}>
                <Text style={styles.buttonText}>Verify</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}>
                <Text 
                  style={[
                    styles.backButtonText,
                    { color: isDark ? '#ccc' : '#666' }
                  ]}>
                  Back to Sign Up
                </Text>
              </TouchableOpacity>
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
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'TtNormsProMedium',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'TtNormsProRegular',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'TtNormsProMedium',
  },
  resendContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  resendText: {
    fontSize: 16,
    fontFamily: 'TtNormsProRegular',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'TtNormsProMedium',
    fontSize: 18,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'TtNormsProRegular',
    textAlign: 'center',
  },
});

export default VerifyScreen;