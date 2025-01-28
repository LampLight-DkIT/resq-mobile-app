import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ListRenderItem,
  Image,
  Linking,
  ActionSheetIOS,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

// Types remain the same
type MessageType = {
  id: string;
  text: string;
  sender: "You" | "Angel Curtis";
  uri?: string;
  type?: "text" | "audio" | "location" | "photo";
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
};

type RouteParams = {
  name: string;
};

interface ChatScreenProps {
  route: {
    params: RouteParams;
  };
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { name } = route.params;
  const flatListRef = useRef<FlatList<MessageType>>(null);

  // State management remains the same
  const [messages, setMessages] = useState<MessageType[]>([
    { id: "1", text: "Hi there!", sender: "Angel Curtis", type: "text" },
    {
      id: "2",
      text: "Hello! How can I help you?",
      sender: "You",
      type: "text",
    },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [showAttachmentOptions, setShowAttachmentOptions] =
    useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Handle image selection from both camera and gallery
  const handleImageSelection = async (imageUri: string) => {
    const newMessage: MessageType = {
      id: Date.now().toString(),
      text: "Photo Message",
      sender: "You",
      type: "photo",
      uri: imageUri,
    };
    setMessages((prev) => [...prev, newMessage]);
    setShowAttachmentOptions(false);
  };

  // Camera handling
  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera access to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await handleImageSelection(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open camera");
      console.error("Camera error:", error);
    }
  };

  // Gallery handling
  const openGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant gallery access to select photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await handleImageSelection(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open gallery");
      console.error("Gallery error:", error);
    }
  };

  // Image picker options
  const handleImagePicker = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            openCamera();
          } else if (buttonIndex === 2) {
            openGallery();
          }
        }
      );
    } else {
      Alert.alert(
        "Select Photo",
        "Choose an option",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Take Photo", onPress: openCamera },
          { text: "Choose from Library", onPress: openGallery },
        ],
        { cancelable: true }
      );
    }
  };

  // Message handling remains the same
  const sendMessage = useCallback(() => {
    if (inputText.trim() === "") return;

    const newMessage: MessageType = {
      id: Date.now().toString(),
      text: inputText,
      sender: "You",
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText]);

  // Location handling remains the same
  const shareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant location access to share your location."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      let address = "";
      try {
        const [addressResult] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (addressResult) {
          address = [
            addressResult.street,
            addressResult.city,
            addressResult.region,
          ]
            .filter(Boolean)
            .join(", ");
        }
      } catch (error) {
        console.warn("Error getting address:", error);
      }

      const newMessage: MessageType = {
        id: Date.now().toString(),
        text: address || "📍 Shared Location",
        sender: "You",
        type: "location",
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address,
        },
      };

      setMessages((prev) => [...prev, newMessage]);
      setShowAttachmentOptions(false);
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
      console.error("Location error:", error);
    }
  };

  // Audio recording functions remain the same
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant microphone access to record audio."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert("Error", "Failed to start recording");
      console.error("Recording error:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        const newMessage: MessageType = {
          id: Date.now().toString(),
          text: "🎤 Audio Message",
          sender: "You",
          type: "audio",
          uri,
        };
        setMessages((prev) => [...prev, newMessage]);
      }

      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      Alert.alert("Error", "Failed to stop recording");
      console.error("Recording error:", error);
    }
  };

  // Open location in maps remains the same
  const openLocation = async (latitude: number, longitude: number) => {
    const url = Platform.select({
      ios: `maps://app?saddr=Current+Location&daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });

    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Maps application is not installed");
      }
    }
  };

  // Render message component remains the same
  const renderMessage: ListRenderItem<MessageType> = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "You"
          ? styles.messageBubbleRight
          : styles.messageBubbleLeft,
      ]}
    >
      {item.type === "location" ? (
        <TouchableOpacity
          onPress={() =>
            item.location &&
            openLocation(item.location.latitude, item.location.longitude)
          }
          style={styles.locationContainer}
        >
          <MaterialIcons
            name='location-on'
            size={24}
            color={item.sender === "You" ? "#fff" : "#000"}
          />
          <View>
            <Text
              style={
                item.sender === "You"
                  ? styles.messageTextRight
                  : styles.messageTextLeft
              }
            >
              {item.text}
            </Text>
            <Text
              style={[
                styles.locationText,
                item.sender === "You"
                  ? styles.messageTextRight
                  : styles.messageTextLeft,
              ]}
            >
              Tap to view in Maps
            </Text>
          </View>
        </TouchableOpacity>
      ) : item.type === "photo" ? (
        <View>
          <Text
            style={
              item.sender === "You"
                ? styles.messageTextRight
                : styles.messageTextLeft
            }
          >
            {item.text}
          </Text>
          {item.uri && (
            <Image source={{ uri: item.uri }} style={styles.photoMessage} />
          )}
        </View>
      ) : (
        <Text
          style={
            item.sender === "You"
              ? styles.messageTextRight
              : styles.messageTextLeft
          }
        >
          {item.text}
        </Text>
      )}
    </View>
  );

  // Updated Attachment options component with separate camera and gallery options
  const AttachmentOptions = () => (
    <View style={styles.attachmentOptionsContainer}>
      <TouchableOpacity
        style={styles.attachmentOptionButton}
        onPress={handleImagePicker}
      >
        <MaterialIcons name='photo-camera' size={24} color='#007bff' />
        <Text style={styles.attachmentOptionText}>Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attachmentOptionButton}
        onPress={shareLocation}
      >
        <MaterialIcons name='location-on' size={24} color='#007bff' />
        <Text style={styles.attachmentOptionText}>Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.attachmentOptionButton}>
        <MaterialIcons name='insert-drive-file' size={24} color='#007bff' />
        <Text style={styles.attachmentOptionText}>Document</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attachmentOptionButton}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Ionicons
          name={isRecording ? "stop-circle" : "mic-outline"}
          size={24}
          color='#007bff'
        />
        <Text style={styles.attachmentOptionText}>
          {isRecording ? "Recording..." : "Audio"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Main render remains the same
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={() => setShowAttachmentOptions(!showAttachmentOptions)}
          >
            <MaterialIcons name='attach-file' size={24} color='#007bff' />
          </TouchableOpacity>

          {showAttachmentOptions && <AttachmentOptions />}

          <TextInput
            style={styles.input}
            placeholder='Type a message...'
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name='send' size={20} color='#fff' />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messageList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: "70%",
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
  },
  messageBubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
  },
  messageBubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
  },
  messageTextLeft: {
    color: "#000",
    fontSize: 16,
  },
  messageTextRight: {
    color: "#fff",
    fontSize: 16,
  },
  photoMessage: {
    width: 200,
    height: 200,
    marginTop: 5,
    borderRadius: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    marginTop: 4,
    textDecorationLine: "underline",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f9f9f9",
    marginBottom: Platform.OS === "ios" ? 20 : 0,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  sendButtonDisabled: {
    backgroundColor: "#b3d9ff",
  },
  attachmentButton: {
    padding: 5,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  attachmentOptionsContainer: {
    position: "absolute",
    bottom: 60,
    left: 10,
    right: 10,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    justifyContent: "space-around",
  },
  attachmentOptionButton: {
    alignItems: "center",
    marginHorizontal: 10,
    padding: 10,
  },
  attachmentOptionText: {
    fontSize: 12,
    color: "#007bff",
    marginTop: 5,
    textAlign: "center",
  },
  // Audio message styles
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  audioIcon: {
    marginRight: 10,
  },
  // Header styles (if needed)
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginLeft: 10,
  },
  // Time stamp styles
  timestamp: {
    fontSize: 11,
    color: "#666",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  // Loading indicator styles
  loadingContainer: {
    padding: 10,
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
    marginTop: 5,
  },
  // Error message styles
  errorContainer: {
    padding: 10,
    backgroundColor: "#ffebee",
    borderRadius: 5,
    margin: 10,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
});

export default ChatScreen;
