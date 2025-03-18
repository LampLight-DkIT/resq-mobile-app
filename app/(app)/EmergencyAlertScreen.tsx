import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FONTS } from "@/constants/fonts";
import * as Location from "expo-location";
import { db, auth } from "@/firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// Contact selection interface
interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
}

const EmergencyAlertScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // State for emergency message
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [shareLocation, setShareLocation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  
  // State for contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);

  // Load saved message and location preference
  useEffect(() => {
    loadSavedEmergencySettings();
    loadContacts();
  }, []);

  const loadSavedEmergencySettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.emergencyMessage) {
          setEmergencyMessage(userData.emergencyMessage);
          setSavedMessage(userData.emergencyMessage);
        }
        if (userData.shareLocationInEmergency !== undefined) {
          setShareLocation(userData.shareLocationInEmergency);
        }
        if (userData.selectedEmergencyContacts) {
          setSelectedContacts(userData.selectedEmergencyContacts);
        }
      }
    } catch (error) {
      console.error("Error loading emergency settings:", error);
    }
  };

  const loadContacts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const contactsRef = collection(db, "users", user.uid, "emergencyContacts");
      const querySnapshot = await getDocs(contactsRef);
      
      const contactsList: EmergencyContact[] = [];
      querySnapshot.forEach((doc) => {
        contactsList.push({
          id: doc.id,
          ...doc.data() as Omit<EmergencyContact, "id">
        });
      });
      
      setContacts(contactsList);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const saveEmergencySettings = async () => {
    try {
      setSaveLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      
      await updateDoc(userRef, {
        emergencyMessage: emergencyMessage,
        shareLocationInEmergency: shareLocation,
        selectedEmergencyContacts: selectedContacts,
        updatedAt: serverTimestamp(),
      });
      
      setSavedMessage(emergencyMessage);
      Alert.alert("Success", "Emergency settings saved successfully");
      
    } catch (error) {
      console.error("Error saving emergency settings:", error);
      Alert.alert("Error", "Failed to save emergency settings");
    } finally {
      setSaveLoading(false);
    }
  };

  const getLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant location access to share your location in emergencies."
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      try {
        const [addressObj] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const addressParts = [
          addressObj.name,
          addressObj.street,
          addressObj.city,
          addressObj.region,
          addressObj.postalCode,
          addressObj.country,
        ].filter(Boolean);

        const address = addressParts.join(", ");
        setCurrentLocation(address);
      } catch (error) {
        console.error("Error getting address:", error);
        setCurrentLocation(
          `Lat: ${location.coords.latitude}, Long: ${location.coords.longitude}`
        );
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your current location");
    } finally {
      setLoading(false);
    }
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const triggerEmergencyAlert = async () => {
    try {
      setLoading(true);
      
      const user = auth.currentUser;
      if (!user) return;
      
      let locationData = null;
      
      if (shareLocation) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          
          if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            
            locationData = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: new Date().toISOString(),
            };
          }
        } catch (error) {
          console.error("Error getting location for emergency:", error);
        }
      }
      
      // Get user profile data
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Get selected contacts data
      const selectedContactsData = await Promise.all(
        selectedContacts.map(async (contactId) => {
          const contactRef = doc(db, "users", user.uid, "emergencyContacts", contactId);
          const contactDoc = await getDoc(contactRef);
          return contactDoc.exists() ? { id: contactId, ...contactDoc.data() } : null;
        })
      );
      
      // Filter out null values
      const validContactsData = selectedContactsData.filter(Boolean);
      
      // Create emergency alert in Firestore
      const alertsRef = collection(db, "emergencyAlerts");
      const newAlertRef = doc(alertsRef);
      
      await setDoc(newAlertRef, {
        userId: user.uid,
        userName: userData.name || user.displayName,
        userEmail: user.email,
        message: emergencyMessage || "Emergency alert triggered!",
        contacts: validContactsData,
        location: locationData,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      Alert.alert(
        "Emergency Alert Sent",
        "Your emergency contacts and the response team have been notified. Stay safe."
      );
      
    } catch (error) {
      console.error("Error triggering emergency alert:", error);
      Alert.alert("Error", "Failed to send emergency alert");
    } finally {
      setLoading(false);
    }
  };

  const confirmEmergencyAlert = () => {
    Alert.alert(
      "Confirm Emergency Alert",
      "Are you sure you want to trigger an emergency alert? This will notify your emergency contacts and the response team.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send Alert",
          style: "destructive",
          onPress: triggerEmergencyAlert,
        },
      ]
    );
  };

  // Render emergency contacts modal
  const renderContactsModal = () => (
    <Modal
      visible={contactsModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setContactsModalVisible(false)}
    >
      <View 
        style={[
          styles.modalContainer, 
          { backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)" }
        ]}
      >
        <View 
          style={[
            styles.modalContent, 
            { backgroundColor: isDark ? "#2C3E50" : "#fff" }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text 
              style={[
                styles.modalTitle, 
                { color: isDark ? "#fff" : "#000" }
              ]}
            >
              Select Emergency Contacts
            </Text>
            <TouchableOpacity 
              onPress={() => setContactsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons 
                name="close" 
                size={24} 
                color={isDark ? "#fff" : "#000"} 
              />
            </TouchableOpacity>
          </View>
          
          {contacts.length === 0 ? (
            <View style={styles.emptyContactsContainer}>
              <Ionicons 
                name="people-outline" 
                size={48} 
                color={isDark ? "#ccc" : "#666"} 
              />
              <Text 
                style={[
                  styles.emptyContactsText, 
                  { color: isDark ? "#ccc" : "#666" }
                ]}
              >
                No emergency contacts added.
              </Text>
              <TouchableOpacity 
                style={styles.addContactButton}
                onPress={() => {
                  setContactsModalVisible(false);
                  // Navigate to add emergency contact screen
                  // navigation.navigate("/(app)/add-emergency-contact");
                }}
              >
                <Text style={styles.addContactButtonText}>
                  Add Contact
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.contactsList}>
              {contacts.map(contact => (
                <TouchableOpacity
                  key={contact.id}
                  style={[
                    styles.contactItem,
                    selectedContacts.includes(contact.id) && styles.selectedContactItem
                  ]}
                  onPress={() => toggleContactSelection(contact.id)}
                >
                  <View style={styles.contactInfo}>
                    <Text 
                      style={[
                        styles.contactName, 
                        { color: isDark ? "#fff" : "#000" }
                      ]}
                    >
                      {contact.name}
                    </Text>
                    <Text 
                      style={[
                        styles.contactRelation, 
                        { color: isDark ? "#ccc" : "#666" }
                      ]}
                    >
                      {contact.relationship}
                    </Text>
                  </View>
                  <View style={styles.checkboxContainer}>
                    {selectedContacts.includes(contact.id) && (
                      <Ionicons name="checkmark-circle" size={24} color="#007bff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => setContactsModalVisible(false)}
          >
            <Text style={styles.doneButtonText}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" }
        ]}
        contentContainerStyle={styles.contentContainer}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        
        {/* Emergency Alert Header */}
        <View style={styles.header}>
          <Text 
            style={[
              styles.headerTitle, 
              { color: isDark ? "#fff" : "#000" }
            ]}
          >
            Emergency Alert
          </Text>
          <Text 
            style={[
              styles.headerDescription, 
              { color: isDark ? "#ccc" : "#666" }
            ]}
          >
            Set up your emergency alert message and preferences. This information will be sent to your emergency contacts and the response team if you trigger an alert.
          </Text>
        </View>
        
        {/* Emergency Message Section */}
        <View 
          style={[
            styles.section, 
            { backgroundColor: isDark ? "#2C3E50" : "#fff" }
          ]}
        >
          <Text 
            style={[
              styles.sectionTitle, 
              { color: isDark ? "#fff" : "#000" }
            ]}
          >
            Emergency Message
          </Text>
          <Text 
            style={[
              styles.sectionDescription, 
              { color: isDark ? "#ccc" : "#666" }
            ]}
          >
            Enter a brief message that will be sent during an emergency.
          </Text>
          
          <TextInput
            style={[
              styles.messageInput,
              { 
                backgroundColor: isDark ? "#34495E" : "#f5f5f5",
                color: isDark ? "#fff" : "#000",
                borderColor: isDark ? "#455d7a" : "#ddd"
              }
            ]}
            placeholder="Example: I need help immediately!"
            placeholderTextColor={isDark ? "#95a5a6" : "#999"}
            value={emergencyMessage}
            onChangeText={setEmergencyMessage}
            multiline
            numberOfLines={3}
            maxLength={100}
          />
          
          <Text 
            style={[
              styles.characterCount, 
              { color: isDark ? "#ccc" : "#666" }
            ]}
          >
            {emergencyMessage.length}/100 characters
          </Text>
          
          {savedMessage && (
            <View style={styles.savedMessageContainer}>
              <Text 
                style={[
                  styles.savedMessageLabel, 
                  { color: isDark ? "#ccc" : "#666" }
                ]}
              >
                Currently saved:
              </Text>
              <Text 
                style={[
                  styles.savedMessage, 
                  { color: isDark ? "#fff" : "#000" }
                ]}
              >
                "{savedMessage}"
              </Text>
            </View>
          )}
        </View>
        
        {/* Location Settings Section */}
        <View 
          style={[
            styles.section, 
            { backgroundColor: isDark ? "#2C3E50" : "#fff" }
          ]}
        >
          <Text 
            style={[
              styles.sectionTitle, 
              { color: isDark ? "#fff" : "#000" }
            ]}
          >
            Location Settings
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text 
                style={[
                  styles.settingLabel, 
                  { color: isDark ? "#fff" : "#000" }
                ]}
              >
                Share Location in Emergency
              </Text>
              <Text 
                style={[
                  styles.settingDescription, 
                  { color: isDark ? "#ccc" : "#666" }
                ]}
              >
                Your current location will be included in emergency alerts
              </Text>
            </View>
            
            <Switch
              value={shareLocation}
              onValueChange={setShareLocation}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={shareLocation ? "#007bff" : "#f4f3f4"}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.testLocationButton}
            onPress={getLocation}
            disabled={loading}
          >
            <Text style={styles.testLocationButtonText}>
              {loading ? "Getting location..." : "Test My Current Location"}
            </Text>
          </TouchableOpacity>
          
          {currentLocation && (
            <View style={styles.currentLocationContainer}>
              <Text 
                style={[
                  styles.currentLocationLabel, 
                  { color: isDark ? "#ccc" : "#666" }
                ]}
              >
                Your current location:
              </Text>
              <Text 
                style={[
                  styles.currentLocation, 
                  { color: isDark ? "#fff" : "#000" }
                ]}
              >
                {currentLocation}
              </Text>
            </View>
          )}
        </View>
        
        {/* Emergency Contacts Section */}
        <View 
          style={[
            styles.section, 
            { backgroundColor: isDark ? "#2C3E50" : "#fff" }
          ]}
        >
          <Text 
            style={[
              styles.sectionTitle, 
              { color: isDark ? "#fff" : "#000" }
            ]}
          >
            Emergency Contacts
          </Text>
          <Text 
            style={[
              styles.sectionDescription, 
              { color: isDark ? "#ccc" : "#666" }
            ]}
          >
            Select contacts who will be notified in an emergency
          </Text>
          
          <TouchableOpacity 
            style={styles.selectContactsButton}
            onPress={() => setContactsModalVisible(true)}
          >
            <Text style={styles.selectContactsButtonText}>
              {selectedContacts.length > 0 
                ? `${selectedContacts.length} Contact${selectedContacts.length > 1 ? 's' : ''} Selected` 
                : "Select Contacts"}
            </Text>
            <MaterialIcons name="people" size={24} color="#fff" />
          </TouchableOpacity>
          
          {selectedContacts.length > 0 && (
            <View style={styles.selectedContactsPreview}>
              {selectedContacts.map((contactId, index) => {
                const contact = contacts.find(c => c.id === contactId);
                if (!contact) return null;
                
                return (
                  <View key={contactId} style={styles.selectedContactChip}>
                    <Text 
                      style={[
                        styles.selectedContactName, 
                        { color: isDark ? "#fff" : "#000" }
                      ]}
                      numberOfLines={1}
                    >
                      {contact.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
        
        {/* Save Settings Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveEmergencySettings}
          disabled={saveLoading}
        >
          {saveLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
        
        {/* Emergency Button */}
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={confirmEmergencyAlert}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="warning" size={24} color="#fff" />
              <Text style={styles.emergencyButtonText}>TRIGGER EMERGENCY ALERT</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text 
          style={[
            styles.emergencyDisclaimer, 
            { color: isDark ? "#ccc" : "#666" }
          ]}
        >
          Press this button only in a real emergency situation. This will alert your emergency contacts and the response team.
        </Text>
        
        {/* Contacts Selection Modal */}
        {renderContactsModal()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.medium,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginBottom: 16,
  },
  messageInput: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  savedMessageContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  savedMessageLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  savedMessage: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontStyle: 'italic',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  testLocationButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  testLocationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  currentLocationContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  currentLocationLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  currentLocation: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  selectContactsButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectContactsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  selectedContactsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  selectedContactChip: {
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedContactName: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    maxWidth: 120,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  emergencyButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FONTS.medium,
    marginLeft: 8,
  },
  emergencyDisclaimer: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
  },
  closeButton: {
    padding: 4,
  },
  contactsList: {
    maxHeight: 300,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedContactItem: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  contactRelation: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  checkboxContainer: {
    width: 30,
    alignItems: 'center',
  },
  emptyContactsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyContactsText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    marginVertical: 12,
    textAlign: 'center',
  },
  addContactButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  addContactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  doneButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.medium,
  }
});

export default EmergencyAlertScreen;