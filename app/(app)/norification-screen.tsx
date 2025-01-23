
// NotificationsScreen.tsx

import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const notifications = [
  { id: "1", title: "New message from Sarah", time: "2 mins ago" },
  { id: "2", title: "Your password was changed", time: "1 hour ago" },
  { id: "3", title: "Reminder: Meeting at 3 PM", time: "5 hours ago" },
];

const NotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
  },
});

export default NotificationsScreen;
