import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FONTS } from '@/constants/fonts';
import { auth } from '@/firebaseConfig';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  sendMessage,
  subscribeToChat,
  getChatId,
  checkMutualFollow,
  ChatMessage
} from '../firebase/firebaseServices';

// Define route params type
interface ChatDetailRouteParams {
  userId: string;
  name: string;
  photoURL?: string;
}

const ChatDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Extract route params
  const { userId, name, photoURL } = route.params as ChatDetailRouteParams;
  
  // States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [canChat, setCanChat] = useState(false);
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const currentUser = auth.currentUser;
  
  // Check if users can chat (mutual follow)
  useEffect(() => {
    const checkCanChat = async () => {
      if (!currentUser) return;
      
      try {
        const mutualFollow = await checkMutualFollow(currentUser.uid, userId);
        setCanChat(mutualFollow);
        
        if (!mutualFollow) {
          Alert.alert(
            "Cannot Send Messages",
            "You can only chat with users who you follow and who follow you back."
          );
        }
      } catch (error) {
        console.error('Error checking mutual follow:', error);
      }
    };
    
    checkCanChat();
  }, [userId]);
  
  // Subscribe to chat messages
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = subscribeToChat(
      currentUser.uid,
      userId,
      (chatMessages) => {
        setMessages(chatMessages);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [userId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Send message function
  const handleSendMessage = async () => {
    if (inputText.trim() === '' || !currentUser || !canChat) return;
    
    try {
      setSending(true);
      
      await sendMessage(currentUser.uid, userId, {
        text: inputText.trim(),
        type: 'text',
      
      });
      
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render message item
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isCurrentUser = item.senderId === currentUser?.uid;
    
    return (
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          { backgroundColor: isCurrentUser 
            ? (isDark ? '#007bff' : '#007bff') 
            : (isDark ? '#34495E' : '#f0f0f0') 
          }
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isCurrentUser 
              ? '#fff' 
              : (isDark ? '#fff' : '#000') 
            }
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            { color: isCurrentUser 
              ? 'rgba(255, 255, 255, 0.7)' 
              : (isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)') 
            }
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView 
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1a1a1a' : '#fff' }
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View 
        style={[
          styles.header,
          { backgroundColor: isDark ? '#2C3E50' : '#f5f5f5' }
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        
        <View style={styles.headerProfile}>
          <Image
            source={{ uri: photoURL || 'https://i.pravatar.cc/150' }}
            style={styles.profileImage}
          />
          <Text 
            style={[
              styles.headerName,
              { color: isDark ? '#fff' : '#000' }
            ]}
          >
            {name}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          {/* Can add more actions here if needed */}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text 
            style={[
              styles.loadingText,
              { color: isDark ? '#ccc' : '#666' }
            ]}
          >
            Loading messages...
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={64}
                color={isDark ? '#455d7a' : '#ccc'}
              />
              <Text 
                style={[
                  styles.emptyText,
                  { color: isDark ? '#ccc' : '#666' }
                ]}
              >
                No messages yet. Start the conversation!
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}
          
          <View 
            style={[
              styles.inputContainer,
              { backgroundColor: isDark ? '#2C3E50' : '#f5f5f5' }
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: isDark ? '#34495E' : '#fff',
                  color: isDark ? '#fff' : '#000',
                  borderColor: isDark ? '#455d7a' : '#ddd'
                }
              ]}
              placeholder="Type a message..."
              placeholderTextColor={isDark ? '#95a5a6' : '#999'}
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={canChat}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: (!canChat || inputText.trim() === '' || sending) ? 0.5 : 1 }
              ]}
              onPress={handleSendMessage}
              disabled={!canChat || inputText.trim() === '' || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          
          {!canChat && (
            <View 
              style={[
                styles.mutualFollowWarning,
                { backgroundColor: isDark ? '#2C3E50' : '#ffe8e8' }
              ]}
            >
              <Text 
                style={[
                  styles.warningText,
                  { color: isDark ? '#ff6b6b' : '#ff3333' }
                ]}
              >
                You can only chat with users who follow you back.
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 8,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  headerName: {
    fontSize: 18,
    fontFamily: FONTS.medium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  currentUserBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  mutualFollowWarning: {
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
});

export default ChatDetailScreen;