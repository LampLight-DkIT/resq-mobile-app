import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FONTS } from "@/constants/fonts";
import { auth } from "@/firebaseConfig";
import { signOut, updateEmail, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // Make sure you've exported db from firebaseConfig
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons"; // Import Material Icons for Android-style icons

const ProfileScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.replace("/(auth)/login");
        return;
      }

      // Set basic info from auth
      setEmail(currentUser.email || "");
      setName(currentUser.displayName || "");

      // Get additional info from Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setPhoneNumber(userData.phoneNumber || "");
        setDob(userData.dob || "");
        setAddress(userData.address || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to update your profile");
        return;
      }

      // Update auth profile
      await updateProfile(currentUser, {
        displayName: name,
      });

      // Only update email if it changed
      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
      }

      // Update Firestore document
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      const userData = {
        displayName: name,
        email: email,
        phoneNumber: phoneNumber,
        dob: dob,
        address: address,
        updatedAt: new Date(),
      };

      if (userDoc.exists()) {
        await updateDoc(userDocRef, userData);
      } else {
        await setDoc(userDocRef, {
          ...userData,
          createdAt: new Date(),
        });
      }

      setIsEditing(false);
      Alert.alert(
        "Profile Updated",
        "Your changes have been saved successfully."
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const navigateToSettings = () => {
    router.push("/(app)/SettingsScreen");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007bff' />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Settings Button with Android-style icon */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={navigateToSettings}
      >
        <MaterialIcons name='settings' size={24} color='#333' />
      </TouchableOpacity>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
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
          autoCapitalize='none'
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

        <TextInput
          style={[styles.input, isEditing && styles.editableInput]}
          value={address}
          onChangeText={setAddress}
          editable={isEditing}
          placeholder='Address'
          multiline
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

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
    fontFamily: FONTS.regular,
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
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 40,
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
