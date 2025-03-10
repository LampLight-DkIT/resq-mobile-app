import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const chats = [
    {
      id: "1",
      name: "Angel Curtis",
      message: "Please help me find a good monitor for t...",
      time: "02:11",
      unread: 2,
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "2",
      name: "Zaire Dorwart",
      message: "Gacor pisan kang",
      time: "02:11",
      unread: 2,
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    // Add other chats here...
  ];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("Chat", { name: item.name })
      }
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {item.message}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.time}>{item.time}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatList: {
    paddingVertical: 10,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    color: "#000",
  },
  message: {
    fontSize: 14,
    color: "#6e6e6e",
    marginTop: 2,
  },
  chatMeta: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 12,
    color: "#6e6e6e",
  },
  unreadBadge: {
    backgroundColor: "#fcb900",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 5,
  },
  unreadText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ChatListScreen;
