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
  TextInput,
  Modal,
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

// ✅ Fix: Make 'countryCode' and 'location' optional to avoid undefined type errors
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(
    null
  );

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

      // ✅ Fix: Ensure optional fields have default values
      const sanitizedContacts: EmergencyContact[] = fetchedContacts.map(
        (contact) => ({
          ...contact,
          countryCode: contact.countryCode ?? "",
          location: contact.location ?? "",
        })
      );

      setContacts(sanitizedContacts);
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
              setLoading(true);
              const user = auth.currentUser;
              if (!user) {
                Alert.alert("Error", "No user logged in.");
                setLoading(false);
                return;
              }

              await deleteEmergencyContact(user.uid, id); // ✅ Fix: Correct order of arguments

              // Remove from state without reloading all contacts
              setContacts((prevContacts) =>
                prevContacts.filter((contact) => contact.id !== id)
              );

              Alert.alert("Success", "Contact deleted successfully.");
            } catch (error) {
              console.error("Error deleting contact:", error);
              Alert.alert("Error", "Failed to delete contact.");
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Open edit modal
  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact({ ...contact });
    setIsEditing(true);
  };

  // Save edited contact
  const saveContact = async () => {
    if (!editingContact || !auth.currentUser) {
      Alert.alert("Error", "Unable to update contact.");
      return;
    }

    try {
      setLoading(true);
      const userId = auth.currentUser.uid;

      await updateEmergencyContact(userId, editingContact.id, editingContact);

      // Refresh contacts list
      await fetchEmergencyContacts();

      // Close modal
      setIsEditing(false);
      setEditingContact(null);

      Alert.alert("Success", "Contact updated successfully.");
    } catch (error) {
      console.error("Error updating contact:", error);
      Alert.alert("Error", "Failed to update contact.");
      setLoading(false);
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

      {/* Header - single instance */}
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
                <View style={styles.phoneContainer}>
                  <Text
                    style={[
                      styles.countryCode,
                      { color: isDark ? "#ccc" : "#666" },
                    ]}
                  >
                    {contact.countryCode}
                  </Text>
                  <Text
                    style={[
                      styles.phoneNumber,
                      { color: isDark ? "#ccc" : "#666" },
                    ]}
                  >
                    {contact.phoneNumber}
                  </Text>
                </View>
                {contact.location && (
                  <View style={styles.locationContainer}>
                    <Ionicons
                      name='location-outline'
                      size={16}
                      color={isDark ? "#ccc" : "#666"}
                    />
                    <Text
                      style={[
                        styles.locationText,
                        { color: isDark ? "#ccc" : "#666" },
                      ]}
                    >
                      {contact.location}
                    </Text>
                  </View>
                )}
              </View>

              {/* Update Button */}
              <TouchableOpacity
                onPress={() => openEditModal(contact)}
                style={styles.iconButton}
              >
                <Ionicons name='pencil' size={22} color='blue' />
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={() => handleDelete(contact.id)}
                style={styles.iconButton}
              >
                <Ionicons name='trash' size={22} color='red' />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name='people-outline'
            size={48}
            color={isDark ? "#ccc" : "#666"}
          />
          <Text
            style={[styles.emptyStateText, { color: isDark ? "#ccc" : "#666" }]}
          >
            No emergency contacts yet
          </Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: "#007bff" }]}
            onPress={() => router.push("/add-emergency-contact")}
          >
            <Text style={styles.emptyStateButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      )}

      {contacts.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: "#007bff" }]}
          onPress={() => router.push("/add-emergency-contact")}
        >
          <Ionicons name='add' size={24} color='#fff' />
        </TouchableOpacity>
      )}

      {/* Edit Contact Modal */}
      <Modal
        visible={isEditing}
        transparent={true}
        animationType='slide'
        onRequestClose={() => {
          setIsEditing(false);
          setEditingContact(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}
            >
              Edit Contact
            </Text>

            {editingContact && (
              <>
                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDark ? "#ccc" : "#666" },
                    ]}
                  >
                    Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#1a1a1a" : "#fff",
                        color: isDark ? "#fff" : "#000",
                        borderColor: isDark ? "#555" : "#ddd",
                      },
                    ]}
                    value={editingContact.name}
                    onChangeText={(text) =>
                      setEditingContact({ ...editingContact, name: text })
                    }
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDark ? "#ccc" : "#666" },
                    ]}
                  >
                    Relationship
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#1a1a1a" : "#fff",
                        color: isDark ? "#fff" : "#000",
                        borderColor: isDark ? "#555" : "#ddd",
                      },
                    ]}
                    value={editingContact.relationship}
                    onChangeText={(text) =>
                      setEditingContact({
                        ...editingContact,
                        relationship: text,
                      })
                    }
                  />
                </View>

                <View style={styles.phoneInputGroup}>
                  <View style={styles.countryCodeContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: isDark ? "#ccc" : "#666" },
                      ]}
                    >
                      Country Code
                    </Text>
                    <TextInput
                      style={[
                        styles.countryCodeInput,
                        {
                          backgroundColor: isDark ? "#1a1a1a" : "#fff",
                          color: isDark ? "#fff" : "#000",
                          borderColor: isDark ? "#555" : "#ddd",
                        },
                      ]}
                      value={editingContact.countryCode}
                      onChangeText={(text) =>
                        setEditingContact({
                          ...editingContact,
                          countryCode: text,
                        })
                      }
                    />
                  </View>

                  <View style={styles.phoneNumberContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: isDark ? "#ccc" : "#666" },
                      ]}
                    >
                      Phone Number
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#1a1a1a" : "#fff",
                          color: isDark ? "#fff" : "#000",
                          borderColor: isDark ? "#555" : "#ddd",
                        },
                      ]}
                      value={editingContact.phoneNumber}
                      onChangeText={(text) =>
                        setEditingContact({
                          ...editingContact,
                          phoneNumber: text,
                        })
                      }
                      keyboardType='phone-pad'
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDark ? "#ccc" : "#666" },
                    ]}
                  >
                    Location
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#1a1a1a" : "#fff",
                        color: isDark ? "#fff" : "#000",
                        borderColor: isDark ? "#555" : "#ddd",
                      },
                    ]}
                    value={editingContact.location}
                    onChangeText={(text) =>
                      setEditingContact({ ...editingContact, location: text })
                    }
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setIsEditing(false);
                      setEditingContact(null);
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={saveContact}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  topBarTitle: {
    fontSize: 20,
    fontFamily: FONTS.medium,
    fontWeight: "bold",
  },
  addButton: { padding: 8 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  contactsList: { flex: 1, padding: 16 },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contactInfo: { flex: 1 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    marginTop: 16,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  contactName: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    fontWeight: "bold",
  },
  relationshipText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryCode: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  phoneNumber: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginLeft: 4,
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.medium,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  phoneInputGroup: {
    flexDirection: "row",
    marginBottom: 16,
  },
  countryCodeContainer: {
    flex: 0.3,
    marginRight: 10,
  },
  phoneNumberContainer: {
    flex: 0.7,
  },
  countryCodeInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  saveButton: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EmergencyContactsScreen;
