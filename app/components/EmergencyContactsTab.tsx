import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Define the props interface
interface TabProps {
  isDark: boolean;
}

// Define the emergency contact interface
interface EmergencyContact {
  id: string;
  relationship: string;
  name: string;
  phoneNumber: string;
  countryCode: string;
  location: string;
  profilePicture?: string;
}

const EmergencyContactsTab: React.FC<TabProps> = ({ isDark }: TabProps) => {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
      ]}
    >
      {/* Add Contact Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: "#007bff" }]}
        onPress={() => router.push("/(app)/add-emergency-contact")}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Emergency Contact</Text>
      </TouchableOpacity>

      {/* Contacts List */}
      <ScrollView style={styles.contactsList}>
        {contacts.map((contact: EmergencyContact) => (
          <TouchableOpacity
            key={contact.id}
            style={[
              styles.contactCard,
              { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
            ]}
            onPress={() =>
              router.push({
                pathname: "/(app)/chat",
                params: { contactId: contact.id },
              })
            }
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
              <View style={styles.locationContainer}>
                <Ionicons
                  name="location-outline"
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
            </View>
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {contacts.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons
            name="people-outline"
            size={48}
            color={isDark ? "#ccc" : "#666"}
          />
          <Text
            style={[
              styles.emptyStateText,
              { color: isDark ? "#ccc" : "#666" },
            ]}
          >
            No emergency contacts yet
          </Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: "#007bff" }]}
            onPress={() => router.push("/(app)/add-emergency-contact")}
          >
            <Text style={styles.emptyStateButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "SpaceMono",
  },
  contactsList: {
    flex: 1,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "SpaceMono",
  },
  relationshipText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "SpaceMono",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  countryCode: {
    fontSize: 14,
    marginRight: 4,
    fontFamily: "SpaceMono",
  },
  phoneNumber: {
    fontSize: 14,
    fontFamily: "SpaceMono",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
    fontFamily: "SpaceMono",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    fontFamily: "SpaceMono",
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceMono",
  },
});

export default EmergencyContactsTab;
