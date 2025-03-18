import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FONTS } from "@/constants/fonts";
import { auth } from "@/firebaseConfig";
import {
  getEmergencyContacts,
  deleteEmergencyContact,
  updateEmergencyContact,
} from "../firebase/firebaseServices";

interface EmergencyContact {
  id: string;
  relationship: string;
  name: string;
  phoneNumber: string;
  countryCode?: string;
  location?: string;
  profilePicture?: string;
  secretMessage?: string;
}

const EmergencyContactsScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No user logged in.");
        return;
      }

      const fetchedContacts = await getEmergencyContacts(user.uid);
      setContacts(fetchedContacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      Alert.alert("Error", "Failed to load emergency contacts.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Contact Function
  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert("Error", "No user logged in.");
                return;
              }
              await deleteEmergencyContact(id, user.uid);
              setContacts(contacts.filter((contact) => contact.id !== id));
              Alert.alert("Success", "Contact deleted successfully.");
            } catch (error) {
              console.error("Error deleting contact:", error);
              Alert.alert("Error", "Failed to delete contact.");
            }
          },
        },
      ]
    );
  };

  // ✅ Update Contact Function
  const handleUpdate = async (contact: EmergencyContact) => {
    if (!auth.currentUser) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    const userId = auth.currentUser.uid; // ✅ Get user ID from auth
    const updatedContact = { ...contact, name: contact.name + " (Updated)" };

    try {
      await updateEmergencyContact(userId, contact.id, updatedContact); // ✅ Pass all 3 arguments
      setContacts(
        contacts.map((c) => (c.id === contact.id ? updatedContact : c))
      );
      Alert.alert("Success", "Contact updated successfully.");
    } catch (error) {
      console.error("Error updating contact:", error);
      Alert.alert("Error", "Failed to update contact.");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
        ]}
      >
        <Text style={[styles.topBarTitle, { color: isDark ? "#fff" : "#000" }]}>
          Emergency Contacts
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-emergency-contact")}
        >
          <Ionicons
            name='add-circle-outline'
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007bff' />
          <Text
            style={[styles.loadingText, { color: isDark ? "#ccc" : "#666" }]}
          >
            Loading contacts...
          </Text>
        </View>
      ) : contacts.length > 0 ? (
        <ScrollView style={styles.contactsList}>
          {contacts.map((contact) => (
            <View
              key={contact.id}
              style={[
                styles.contactCard,
                { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
              ]}
            >
              <Image
                source={
                  contact.profilePicture
                    ? { uri: contact.profilePicture }
                    : require("@/assets/images/sample/default-avatar.png")
                }
                style={styles.profilePicture}
              />
              <View style={styles.contactInfo}>
                <Text
                  style={[
                    styles.contactName,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {contact.name}
                </Text>
                <Text
                  style={[
                    styles.relationshipText,
                    { color: isDark ? "#ccc" : "#666" },
                  ]}
                >
                  {contact.relationship}
                </Text>
                <Text
                  style={[
                    styles.phoneNumber,
                    { color: isDark ? "#ccc" : "#666" },
                  ]}
                >
                  {contact.countryCode} {contact.phoneNumber}
                </Text>
              </View>

              {/* Update Button */}
              <TouchableOpacity onPress={() => handleUpdate(contact)}>
                <Ionicons
                  name='pencil'
                  size={22}
                  color='blue'
                  style={styles.icon}
                />
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity onPress={() => handleDelete(contact.id)}>
                <Ionicons
                  name='trash'
                  size={22}
                  color='red'
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text
            style={[styles.emptyStateText, { color: isDark ? "#ccc" : "#666" }]}
          >
            No emergency contacts yet
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  topBarTitle: { fontSize: 20, fontWeight: "bold" },
  addButton: { padding: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  contactsList: { flex: 1, padding: 16 },
  loadingText: { fontSize: 16, marginTop: 8 },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  profilePicture: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  contactInfo: { flex: 1 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  relationshipText: { fontSize: 16, marginTop: 4 },
  phoneNumber: { fontSize: 16 },
  emptyStateText: { fontSize: 16 },
  icon: { marginHorizontal: 8 },
  contactName: { fontSize: 18, fontWeight: "bold" },
});

export default EmergencyContactsScreen;
