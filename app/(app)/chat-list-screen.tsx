import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FONTS } from "@/constants/fonts";
import { auth, db } from "@/firebaseConfig";
import { subscribeToUserChats } from "../firebase/firebaseServices";

interface ChatPreview {
  id: string;
  lastMessage: string;
  lastMessageTimestamp: any;
  unread: number;
  otherUser: {
    id: string;
    name: string;
    photoURL: string | null;
  };
}

const ChatListScreen = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Subscribe to user's chats
    const unsubscribe = subscribeToUserChats(currentUser.uid, (chatPreviews) => {
      setChats(chatPreviews);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Format timestamp for display
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    
    // If same day, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If within a week, show day of week
    const dayDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("ChatDetail", { 
          userId: item.otherUser.id, 
          name: item.otherUser.name,
          photoURL: item.otherUser.photoURL 
        })
      }
    >
      <Image 
        source={{ 
          uri: item.otherUser.photoURL || "https://i.pravatar.cc/150" 
        }} 
        style={styles.avatar} 
      />
      <View style={styles.chatContent}>
        <Text style={styles.name}>{item.otherUser.name}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.time}>{formatTime(item.lastMessageTimestamp)}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="chatbubbles-outline" 
        size={64} 
        color={isDark ? "#455d7a" : "#ccc"} 
      />
      <Text style={[
        styles.emptyText, 
        { color: isDark ? "#ccc" : "#666" }
      ]}>
        No chats yet. Start a conversation from the Users tab!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: isDark ? "#1a1a1a" : "#fff" }
    ]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[
          styles.headerTitle, 
          { color: isDark ? "#fff" : "#000" }
        ]}>
          Chats
        </Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={[
            styles.loadingText, 
            { color: isDark ? "#ccc" : "#666" }
          ]}>
            Loading conversations...
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatList}
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.medium,
  },
  chatList: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatContent: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: FONTS.medium,
    color: "#000",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#6e6e6e",
    fontFamily: FONTS.regular,
  },
  chatMeta: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 12,
    color: "#6e6e6e",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: "#fcb900",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
});

export default ChatListScreen;