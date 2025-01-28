import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
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

// Constants
const RELATIONSHIPS = [
  "Parent",
  "Spouse",
  "Sibling",
  "Child",
  "Friend",
  "Guardian",
  "Relative",
  "Caregiver",
  "Other",
];

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
  const [showRelationships, setShowRelationships] = useState(false);

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

  const renderRelationshipItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.relationshipItem,
        { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
      ]}
      onPress={() => {
        setContact({ ...contact, relationship: item });
        setShowRelationships(false);
      }}
    >
      <Text style={[styles.text, { color: isDark ? "#fff" : "#000" }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  // UI Components
  const renderTopBar = () => (
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
  );

  const renderProfilePicture = () => (
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
  );

  const renderForm = () => (
    <ScrollView style={styles.form}>
      {renderProfilePicture()}

      <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#000" }]}>
        Relationship
      </Text>
      <TouchableOpacity
        style={[
          styles.input,
          { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
        ]}
        onPress={() => setShowRelationships(true)}
      >
        <Text
          style={[
            styles.text,
            {
              color: contact.relationship
                ? isDark
                  ? "#fff"
                  : "#000"
                : isDark
                ? "#95a5a6"
                : "#666",
            },
          ]}
        >
          {contact.relationship || "Select relationship"}
        </Text>
      </TouchableOpacity>

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
          onChangeText={(text) => setContact({ ...contact, phoneNumber: text })}
          placeholder='Enter phone number'
          placeholderTextColor={isDark ? "#95a5a6" : "#666"}
          keyboardType='phone-pad'
        />
      </View>

      <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#000" }]}>
        Location
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#2C3E50" : "#f5f5f5",
            color: isDark ? "#fff" : "#000",
          },
        ]}
        value={contact.location}
        onChangeText={(text) => setContact({ ...contact, location: text })}
        placeholder='Enter location'
        placeholderTextColor={isDark ? "#95a5a6" : "#666"}
      />

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
        onChangeText={(text) => setContact({ ...contact, secretMessage: text })}
        placeholder='Enter a secret message'
        placeholderTextColor={isDark ? "#95a5a6" : "#666"}
      />
    </ScrollView>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {renderTopBar()}
      {renderForm()}

      <Modal
        visible={showRelationships}
        transparent
        animationType='slide'
        onRequestClose={() => setShowRelationships(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}
              >
                Select Relationship
              </Text>
              <TouchableOpacity onPress={() => setShowRelationships(false)}>
                <Ionicons
                  name='close'
                  size={24}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={RELATIONSHIPS}
              renderItem={renderRelationshipItem}
              keyExtractor={(item) => item}
              style={styles.relationshipsList}
            />
          </View>
        </View>
      </Modal>
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
  text: {
    fontFamily: FONTS.regular,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: FONTS.medium,
  },
  relationshipsList: {
    flex: 1,
  },
  relationshipItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default AddEmergencyContactScreen;
