import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FONTS } from "@/constants/fonts";

// Types
interface ContactState {
  relationship: string;
  name: string;
  phoneNumber: string;
  countryCode: CountryCode;
  callingCode: string;
  location: string;
  profilePicture: string;
  secretMessage: string;
}

const AddEmergencyContactScreen: React.FC = () => {
  // Hooks
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // State
  const [contact, setContact] = useState<ContactState>({
    relationship: "",
    name: "",
    phoneNumber: "",
    countryCode: "GB",
    callingCode: "+44",
    location: "",
    profilePicture: "",
    secretMessage: "",
  });

  // Handlers
  const handleSave = () => {
    console.log(contact);
    router.back();
  };

  const onSelectCountry = (country: Country) => {
    setContact({
      ...contact,
      countryCode: country.cca2,
      callingCode: "+" + country.callingCode[0],
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name='arrow-back'
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: isDark ? "#fff" : "#000" }]}>
          Add Emergency Contact
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveButton, { color: "#007bff" }]}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.form}>
        <TouchableOpacity style={styles.profilePictureContainer}>
          <Image
            source={
              contact.profilePicture
                ? { uri: contact.profilePicture }
                : require("@/assets/images/sample/default-avatar.png")
            }
            style={styles.profilePicture}
          />
          <View style={styles.addPhotoButton}>
            <Ionicons name='camera' size={20} color='#fff' />
          </View>
        </TouchableOpacity>

        {/* Relationship Input (TextInput) */}
        <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#000" }]}>
          Relationship
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#2C3E50" : "#f5f5f5",
              color: isDark ? "#fff" : "#000",
            },
          ]}
          value={contact.relationship}
          onChangeText={(text) =>
            setContact({ ...contact, relationship: text })
          }
          placeholder='Enter relationship'
          placeholderTextColor={isDark ? "#95a5a6" : "#666"}
        />

        {/* Name Input */}
        <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#000" }]}>
          Name
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#2C3E50" : "#f5f5f5",
              color: isDark ? "#fff" : "#000",
            },
          ]}
          value={contact.name}
          onChangeText={(text) => setContact({ ...contact, name: text })}
          placeholder='Enter contact name'
          placeholderTextColor={isDark ? "#95a5a6" : "#666"}
        />

        {/* Phone Number Input */}
        <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#000" }]}>
          Phone Number
        </Text>
        <View style={styles.phoneInputContainer}>
          <CountryPicker
            countryCode={contact.countryCode}
            withFilter
            withFlag
            withCallingCode
            withCountryNameButton={false}
            onSelect={onSelectCountry}
            theme={{
              backgroundColor: isDark ? "#2C3E50" : "#fff",
              onBackgroundTextColor: isDark ? "#fff" : "#000",
            }}
            containerButtonStyle={[
              styles.countryCodeButton,
              { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
            ]}
          />
          <TextInput
            style={[
              styles.phoneInput,
              {
                backgroundColor: isDark ? "#2C3E50" : "#f5f5f5",
                color: isDark ? "#fff" : "#000",
              },
            ]}
            value={contact.phoneNumber}
            onChangeText={(text) =>
              setContact({ ...contact, phoneNumber: text })
            }
            placeholder='Enter phone number'
            placeholderTextColor={isDark ? "#95a5a6" : "#666"}
            keyboardType='phone-pad'
          />
        </View>

        {/* Secret Message Input (Kept as requested) */}
        <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#000" }]}>
          Secret Message
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#2C3E50" : "#f5f5f5",
              color: isDark ? "#fff" : "#000",
            },
          ]}
          value={contact.secretMessage}
          onChangeText={(text) =>
            setContact({ ...contact, secretMessage: text })
          }
          placeholder='Enter a secret message'
          placeholderTextColor={isDark ? "#95a5a6" : "#666"}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: FONTS.medium,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: FONTS.medium,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  addPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#007bff",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: "center",
    fontFamily: FONTS.regular,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  countryCodeButton: {
    height: 50,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    marginRight: 8,
    minWidth: 100,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: FONTS.regular,
  },
});

export default AddEmergencyContactScreen;
