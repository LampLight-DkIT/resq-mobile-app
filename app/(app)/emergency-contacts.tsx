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
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "hooks/useColorScheme";
import { FONTS } from "constants/fonts";

interface EmergencyContact {
  id: string;
  relationship: string;
  name: string;
  phoneNumber: string;
  countryCode: string;
  location: string;
  profilePicture?: string;
}

const EmergencyContactsScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

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
        <Text style={[styles.topBarTitle, { color: isDark ? "#fff" : "#000" }]}>
          Add Contacts
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(app)/add-emergency-contact")}
        >
          <Ionicons
            name='add-circle-outline'
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      <ScrollView style={styles.contactsList}>
        {contacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={[
              styles.contactCard,
              { backgroundColor: isDark ? "#2C3E50" : "#f5f5f5" },
            ]}
            onPress={() =>
              router.push({
                pathname: "/(app)/chat-list-screen",
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
            </View>
            <Ionicons
              name='chatbubble-outline'
              size={24}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {contacts.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons
            name='people-outline'
            size={48}
            color={isDark ? "#ccc" : "#666"}
          />
          <Text
            style={[styles.emptyStateText, { color: isDark ? "#ccc" : "#666" }]}
          >
            No contacts yet
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
    fontFamily: FONTS.medium,
    fontWeight: "bold",
  },
  addButton: {
    padding: 8,
  },
  contactsList: {
    flex: 1,
    padding: 16,
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
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  relationshipText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  countryCode: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginRight: 4,
  },
  phoneNumber: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    marginTop: 12,
    marginBottom: 20,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONTS.medium,
    fontWeight: "bold",
  },
});

export default EmergencyContactsScreen;
