import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { FONTS } from "@/constants/fonts";

// Import navigation types - you would need to have react-navigation installed
type ProfileScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [name, setName] = useState("Simisola Kisembo");
  const [email, setEmail] = useState("simisola@example.com");
  const [phoneNumber, setPhoneNumber] = useState("+1 1234567890");
  const [dob, setDob] = useState("1990-01-01");
  const [address, setAddress] = useState("123 Main Street, Springfield, USA");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Profile Updated", "Your changes have been saved locally.");
  };

  const navigateToSettings = () => {
    // Navigate to the Settings screen
    navigation.navigate("SettingsScreen");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={navigateToSettings}
      >
        <Text style={styles.settingsButtonText}>⚙️</Text>
      </TouchableOpacity>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150" }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageIcon}>
            <Text style={styles.editImageText}>✎</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.nameText}>{name}</Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      {/* Editable Profile Details */}
      <View style={styles.card}>
        <TextInput
          style={[styles.input, isEditing && styles.editableInput]}
          value={name}
          onChangeText={setName}
          editable={isEditing}
          placeholder='Name'
        />

        <TextInput
          style={[styles.input, isEditing && styles.editableInput]}
          value={email}
          onChangeText={setEmail}
          editable={isEditing}
          placeholder='Email'
          keyboardType='email-address'
        />

        <TextInput
          style={[styles.input, isEditing && styles.editableInput]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          editable={isEditing}
          placeholder='Phone Number'
          keyboardType='phone-pad'
        />

        <TextInput
          style={[styles.input, isEditing && styles.editableInput]}
          value={dob}
          onChangeText={setDob}
          editable={isEditing}
          placeholder='Date of Birth (YYYY-MM-DD)'
        />
      </View>

      {/* Edit/Save Button */}
      <View style={styles.actionButtons}>
        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Settings Option */}
      <TouchableOpacity
        style={styles.optionButton}
        onPress={navigateToSettings}
      >
        <Text style={styles.optionText}>Settings</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  settingsButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#f0f0f0",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#007bff",
  },
  editImageIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007bff",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  editImageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    fontFamily: FONTS.medium,
  },
  emailText: {
    fontSize: 16,
    color: "#555",
    fontFamily: FONTS.regular,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontFamily: FONTS.regular,
  },
  editableInput: {
    backgroundColor: "#fff",
    borderColor: "#007bff",
  },
  actionButtons: {
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: FONTS.medium,
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: FONTS.medium,
  },
  optionButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: FONTS.medium,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: FONTS.medium,
  },
});

export default ProfileScreen;
