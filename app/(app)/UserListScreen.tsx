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
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { FONTS } from "@/constants/fonts";
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot 
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

// Define User type
interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  followers: string[];
  following: string[];
  status?: string; // Optional status message
}

const UserListScreen = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch all users and current user on component mount
  useEffect(() => {
    fetchCurrentUser();
    const usersUnsubscribe = fetchUsers();
    
    return () => {
      if (typeof usersUnsubscribe === 'function') {
        usersUnsubscribe();
      }
    };
  }, []);

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchCurrentUser = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, "id">;
        setCurrentUser({ id: user.uid, ...userData });
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchUsers = () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const usersRef = collection(db, "users");
      
      // Set up real-time listener for users collection
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const usersList: User[] = [];
        
        snapshot.forEach(doc => {
          // Don't include current user in the list
          if (doc.id !== user.uid) {
            const userData = doc.data() as Omit<User, "id">;
            usersList.push({ 
              id: doc.id, 
              ...userData,
              followers: userData.followers || [],
              following: userData.following || [],
            });
          }
        });
        
        setUsers(usersList);
        setFilteredUsers(usersList);
        setLoading(false);
        setRefreshing(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCurrentUser();
    fetchUsers();
  };

  const toggleFollow = async (userId: string) => {
    try {
      if (!currentUser) return;
      
      const isFollowing = currentUser.following.includes(userId);
      const currentUserRef = doc(db, "users", currentUser.id);
      const targetUserRef = doc(db, "users", userId);
      
      // Update current user's following list
      await updateDoc(currentUserRef, {
        following: isFollowing ? arrayRemove(userId) : arrayUnion(userId)
      });
      
      // Update target user's followers list
      await updateDoc(targetUserRef, {
        followers: isFollowing ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id)
      });
      
      // Update local state
      setCurrentUser(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          following: isFollowing 
            ? prev.following.filter(id => id !== userId)
            : [...prev.following, userId]
        };
      });
      
    } catch (error) {
      console.error("Error toggling follow:", error);
      Alert.alert("Error", "Failed to update follow status");
    }
  };

  const canChat = (user: User): boolean => {
    if (!currentUser) return false;
    
    // Users can chat if they follow each other (mutual follow)
    return (
      currentUser.following.includes(user.id) && 
      user.followers.includes(currentUser.id) &&
      user.following.includes(currentUser.id) && 
      currentUser.followers.includes(user.id)
    );
  };

  const startChat = (user: User) => {
    navigation.navigate("ChatDetail", { 
      name: user.name,
      userId: user.id,
      photoURL: user.photoURL 
    });
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isFollowing = currentUser?.following.includes(item.id);
    const isMutualFollow = canChat(item);
    
    return (
      <View 
        style={[
          styles.userItem, 
          { backgroundColor: isDark ? "#2C3E50" : "#fff" }
        ]}
      >
        <Image 
          source={{ uri: item.photoURL || "https://i.pravatar.cc/150" }} 
          style={styles.avatar} 
        />
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: isDark ? "#fff" : "#000" }]}>
            {item.name}
          </Text>
          {item.status && (
            <Text style={[styles.userStatus, { color: isDark ? "#ccc" : "#666" }]}>
              {item.status}
            </Text>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.followButton,
              { 
                backgroundColor: isFollowing ? 
                  (isDark ? "#455d7a" : "#e6e6e6") : 
                  "#007bff"
              }
            ]}
            onPress={() => toggleFollow(item.id)}
          >
            <Text style={[
              styles.followButtonText,
              { color: isFollowing ? (isDark ? "#fff" : "#000") : "#fff" }
            ]}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
          
          {isMutualFollow && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => startChat(item)}
            >
              <Ionicons 
                name="chatbubble-outline" 
                size={24} 
                color={isDark ? "#fff" : "#000"} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="people-outline" 
        size={64} 
        color={isDark ? "#455d7a" : "#ccc"} 
      />
      <Text style={[styles.emptyText, { color: isDark ? "#ccc" : "#666" }]}>
        {searchQuery.trim() !== "" 
          ? "No users match your search" 
          : "No users found"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" }
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}>
          Users
        </Text>
      </View>
      
      <View 
        style={[
          styles.searchContainer, 
          { backgroundColor: isDark ? "#2C3E50" : "#fff" }
        ]}
      >
        <Ionicons 
          name="search" 
          size={20} 
          color={isDark ? "#ccc" : "#666"} 
          style={styles.searchIcon} 
        />
        <TextInput
          style={[
            styles.searchInput,
            { color: isDark ? "#fff" : "#000" }
          ]}
          placeholder="Search users..."
          placeholderTextColor={isDark ? "#95a5a6" : "#999"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.trim() !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={isDark ? "#ccc" : "#666"} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={[styles.loadingText, { color: isDark ? "#ccc" : "#666" }]}>
            Loading users...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007bff"]}
              tintColor={isDark ? "#fff" : "#007bff"}
            />
          }
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  followButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  chatButton: {
    marginLeft: 8,
    padding: 8,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
});

export default UserListScreen;