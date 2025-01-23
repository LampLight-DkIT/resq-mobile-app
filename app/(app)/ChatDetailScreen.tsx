import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatDetailScreen: React.FC<{ route: any }> = ({ route }) => {
  const { chatId, chatName } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.chatTitle}>Chat with {chatName}</Text>
      <Text>Chat ID: {chatId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ChatDetailScreen;
