import React, { useState, useRef, useCallback } from 'react';
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
  FlatListProps,
  Linking,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';

// Types
type MessageType = {
  id: string;
  text: string;
  sender: 'You' | 'Angel Curtis';
  uri?: string;
  type?: 'text' | 'audio' | 'location';
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

  // State management
  const [messages, setMessages] = useState<MessageType[]>([
    { id: '1', text: 'Hi there!', sender: 'Angel Curtis', type: 'text' },
    { id: '2', text: 'Hello! How can I help you?', sender: 'You', type: 'text' },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [showAttachmentOptions, setShowAttachmentOptions] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Message handling
  const sendMessage = useCallback(() => {
    if (inputText.trim() === '') return;

    const newMessage: MessageType = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'You',
      type: 'text',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Scroll to bottom after sending message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText]);

  // Location handling
  const shareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant location access to share your location.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      // Get address if possible
      let address = '';
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
          ].filter(Boolean).join(', ');
        }
      } catch (error) {
        console.warn('Error getting address:', error);
      }

      const newMessage: MessageType = {
        id: Date.now().toString(),
        text: address || '📍 Shared Location',
        sender: 'You',
        type: 'location',
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address,
        },
      };

      setMessages(prev => [...prev, newMessage]);
      setShowAttachmentOptions(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
      console.error('Location error:', error);
    }
  };

  // Open location in maps
  const openLocation = (latitude: number, longitude: number) => {
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const url = Platform.select({
      ios: `${scheme}${latitude},${longitude}`,
      android: `${scheme}${latitude},${longitude}?q=${latitude},${longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open maps');
      });
    }
  };

  // Audio recording functions
  const startRecording = async (): Promise<void> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone access to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: undefined,
          bitsPerSecond: undefined
        }
      });
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = async (): Promise<void> => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const newMessage: MessageType = {
          id: Date.now().toString(),
          text: 'Audio Message',
          sender: 'You',
          type: 'audio',
          uri,
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
      console.error('Stop recording error:', error);
    } finally {
      setRecording(null);
      setIsRecording(false);
    }
  };

  // Render message component
  const renderMessage: ListRenderItem<MessageType> = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'You' ? styles.messageBubbleRight : styles.messageBubbleLeft,
      ]}
    >
      {item.type === 'location' ? (
        <TouchableOpacity
          onPress={() => item.location && openLocation(item.location.latitude, item.location.longitude)}
          style={styles.locationContainer}
        >
          <MaterialIcons
            name="location-on"
            size={24}
            color={item.sender === 'You' ? '#fff' : '#000'}
          />
          <View>
            <Text style={item.sender === 'You' ? styles.messageTextRight : styles.messageTextLeft}>
              {item.text}
            </Text>
            <Text style={[
              styles.locationText,
              item.sender === 'You' ? styles.messageTextRight : styles.messageTextLeft
            ]}>
              Tap to view in Maps
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={item.sender === 'You' ? styles.messageTextRight : styles.messageTextLeft}>
            {item.text}
          </Text>
          {item.uri && item.type === 'audio' && (
            <Text style={styles.audioIndicator}>
              🎵 Audio Message
            </Text>
          )}
        </>
      )}
    </View>
  );

  // Attachment options component
  const AttachmentOptions = () => (
    <View style={styles.attachmentOptionsContainer}>
      <TouchableOpacity style={styles.attachmentOptionButton}>
        <MaterialIcons name="photo" size={24} color="#007bff" />
        <Text style={styles.attachmentOptionText}>Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.attachmentOptionButton} onPress={shareLocation}>
        <MaterialIcons name="location-on" size={24} color="#007bff" />
        <Text style={styles.attachmentOptionText}>Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.attachmentOptionButton}>
        <MaterialIcons name="insert-drive-file" size={24} color="#007bff" />
        <Text style={styles.attachmentOptionText}>Document</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attachmentOptionButton}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Ionicons name={isRecording ? "stop-circle" : "mic-outline"} size={24} color="#007bff" />
        <Text style={styles.attachmentOptionText}>
          {isRecording ? 'Recording...' : 'Audio'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={() => setShowAttachmentOptions(!showAttachmentOptions)}
          >
            <MaterialIcons name="attach-file" size={24} color="#007bff" />
          </TouchableOpacity>

          {showAttachmentOptions && <AttachmentOptions />}

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
  },
  messageBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  messageTextLeft: {
    color: '#000',
    fontSize: 16,
  },
  messageTextRight: {
    color: '#fff',
    fontSize: 16,
  },
  audioIndicator: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#b3d9ff',
  },
  attachmentButton: {
    padding: 5,
    marginRight: 10,
  },
  attachmentOptionsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  attachmentOptionButton: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  attachmentOptionText: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 5,
  },
});

export default ChatScreen;