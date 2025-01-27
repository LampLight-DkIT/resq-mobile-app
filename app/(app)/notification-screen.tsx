import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

const initialNotifications = [
  { id: "1", title: "New message from Sarah", time: "2 mins ago" },
  { id: "2", title: "Your password was changed", time: "1 hour ago" },
  { id: "3", title: "Reminder: Meeting at 3 PM", time: "5 hours ago" },
];

const NotificationScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleClearAll = () => {
    setNotifications([]); // Clear the notifications
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Notifications</Text>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications available</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clearButton: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationTime: {
    fontSize: 14,
    color: "#888",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});

export default NotificationScreen;
