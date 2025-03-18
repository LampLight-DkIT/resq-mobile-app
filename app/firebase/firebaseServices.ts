// firebase/firebaseServices.ts
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  addDoc,
  arrayUnion,
  arrayRemove,
  DocumentData,
  DocumentReference,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/firebaseConfig";
import { deleteDoc as firestoreDeleteDoc } from "firebase/firestore";

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  followers: string[];
  following: string[];
  status?: string;
  emergencyMessage?: string;
  shareLocationInEmergency?: boolean;
  selectedEmergencyContacts?: string[];
  lastSeen?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface EmergencyContact {
  id: string;
  relationship: string;
  name: string;
  phoneNumber: string;
  countryCode?: string;
  location?: string;
  profilePicture?: string;
  secretMessage?: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  contacts: Partial<EmergencyContact>[];
  location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  status: "active" | "resolved" | "cancelled";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  read: boolean;
  type: "text" | "image" | "location" | "audio";
  imageUrl?: string;
  audioUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

// User Services
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const toggleFollowUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  try {
    // Get both user documents
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);
    const currentUserDoc = await getDoc(currentUserRef);

    if (!currentUserDoc.exists()) {
      throw new Error("User document not found");
    }

    const userData = currentUserDoc.data();
    const isFollowing =
      userData.following && userData.following.includes(targetUserId);

    // Update current user's following list
    await updateDoc(currentUserRef, {
      following: isFollowing
        ? arrayRemove(targetUserId)
        : arrayUnion(targetUserId),
      updatedAt: serverTimestamp(),
    });

    // Update target user's followers list
    await updateDoc(targetUserRef, {
      followers: isFollowing
        ? arrayRemove(currentUserId)
        : arrayUnion(currentUserId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error toggling follow status:", error);
    throw error;
  }
};

export const checkMutualFollow = async (
  userId1: string,
  userId2: string
): Promise<boolean> => {
  try {
    const user1DocRef = doc(db, "users", userId1);
    const user2DocRef = doc(db, "users", userId2);

    const user1Doc = await getDoc(user1DocRef);
    const user2Doc = await getDoc(user2DocRef);

    if (!user1Doc.exists() || !user2Doc.exists()) {
      return false;
    }

    const user1Data = user1Doc.data();
    const user2Data = user2Doc.data();

    return (
      user1Data.following?.includes(userId2) &&
      user2Data.followers?.includes(userId1) &&
      user2Data.following?.includes(userId1) &&
      user1Data.followers?.includes(userId2)
    );
  } catch (error) {
    console.error("Error checking mutual follow:", error);
    return false;
  }
};

// Chat Services
export const getChatId = (userId1: string, userId2: string): string => {
  // Create a consistent chat ID regardless of order
  return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
};

export const sendMessage = async (
  senderId: string,
  recipientId: string,
  messageData: Omit<ChatMessage, "id" | "senderId" | "timestamp" | "read">
): Promise<string> => {
  try {
    const chatId = getChatId(senderId, recipientId);
    const messagesRef = collection(db, "chats", chatId, "messages");

    const newMessageRef = await addDoc(messagesRef, {
      ...messageData,
      senderId,
      timestamp: serverTimestamp(),
      read: false,
    });

    // Update chat metadata
    await setDoc(
      doc(db, "chats", chatId),
      {
        participants: [senderId, recipientId],
        lastMessage: messageData.text,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: senderId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return newMessageRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const subscribeToChat = (
  userId1: string,
  userId2: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const chatId = getChatId(userId1, userId2);
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((docSnapshot) => {
      messages.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as ChatMessage);
    });
    callback(messages);
  });
};

// Emergency Contact Services`
export const getEmergencyContacts = async (
  userId: string
): Promise<EmergencyContact[]> => {
  try {
    const contactsRef = collection(db, "users", userId, "emergencyContacts");
    const snapshot = await getDocs(contactsRef);

    const contacts: EmergencyContact[] = [];
    snapshot.forEach((docSnapshot) => {
      contacts.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as EmergencyContact);
    });

    return contacts;
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    throw error;
  }
};

export const addEmergencyContact = async (
  userId: string,
  contactData: Omit<EmergencyContact, "id">
): Promise<string> => {
  try {
    const contactsRef = collection(db, "users", userId, "emergencyContacts");
    const newContactRef = await addDoc(contactsRef, {
      ...contactData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newContactRef.id;
  } catch (error) {
    console.error("Error adding emergency contact:", error);
    throw error;
  }
};

export const updateEmergencyContact = async (
  userId: string,
  contactId: string,
  contactData: Partial<EmergencyContact>
): Promise<void> => {
  try {
    const contactRef = doc(db, "users", userId, "emergencyContacts", contactId);
    await updateDoc(contactRef, {
      ...contactData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating emergency contact:", error);
    throw error;
  }
};

// Delete an emergency contact
export const deleteEmergencyContact = async (
  userId: string,
  contactId: string
): Promise<void> => {
  try {
    const contactRef = doc(db, "users", userId, "emergencyContacts", contactId);
    await deleteDoc(contactRef); // ✅ Ensure you're using Firebase's deleteDoc
  } catch (error) {
    console.error("Error deleting emergency contact:", error);
    throw error;
  }
};

// Emergency Alert Services
export const createEmergencyAlert = async (
  userId: string,
  alertData: Omit<EmergencyAlert, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const alertsRef = collection(db, "emergencyAlerts");
    const newAlertRef = await addDoc(alertsRef, {
      ...alertData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newAlertRef.id;
  } catch (error) {
    console.error("Error creating emergency alert:", error);
    throw error;
  }
};

export const updateEmergencyAlertStatus = async (
  alertId: string,
  status: "active" | "resolved" | "cancelled"
): Promise<void> => {
  try {
    const alertRef = doc(db, "emergencyAlerts", alertId);
    await updateDoc(alertRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating emergency alert status:", error);
    throw error;
  }
};

// Upload Files
export const uploadFile = async (
  uri: string,
  path: string,
  contentType: string
): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob, { contentType });

    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Real-time Listeners
export const subscribeToUserProfile = (
  userId: string,
  callback: (user: User) => void
) => {
  const userRef = doc(db, "users", userId);

  return onSnapshot(userRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      callback({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as User);
    }
  });
};

export const subscribeToEmergencyAlerts = (
  callback: (alerts: EmergencyAlert[]) => void
) => {
  const alertsRef = collection(db, "emergencyAlerts");
  const q = query(
    alertsRef,
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const alerts: EmergencyAlert[] = [];
    snapshot.forEach((docSnapshot) => {
      alerts.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as EmergencyAlert);
    });
    callback(alerts);
  });
};

export const subscribeToUserChats = (
  userId: string,
  callback: (chatPreviews: any[]) => void
) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId),
    orderBy("lastMessageTimestamp", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    const chatPreviews = [];

    for (const docSnapshot of snapshot.docs) {
      const chatData = docSnapshot.data();
      const otherUserId = chatData.participants.find(
        (id: string) => id !== userId
      );

      // Get the other user's info
      const userDocRef = doc(db, "users", otherUserId);
      const userSnapshot = await getDoc(userDocRef);
      const userData = userSnapshot.exists() ? userSnapshot.data() : null;

      chatPreviews.push({
        id: docSnapshot.id,
        lastMessage: chatData.lastMessage,
        lastMessageTimestamp: chatData.lastMessageTimestamp,
        unread: 0, // We'll implement unread counts later
        otherUser: {
          id: otherUserId,
          name: userData?.name || "Unknown User",
          photoURL: userData?.photoURL || null,
        },
      });
    }

    callback(chatPreviews);
  });
};

// Initialize User after signup
export const initializeUserProfile = async (
  userId: string,
  data: {
    name: string;
    email: string;
    phoneNumber?: string;
    photoURL?: string;
  }
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      ...data,
      followers: [],
      following: [],
      emergencyMessage: "",
      shareLocationInEmergency: true,
      selectedEmergencyContacts: [],
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error initializing user profile:", error);
    throw error;
  }
};

// Add a default export (dummy object)
const firebaseServices = {
  getUserProfile,
  updateUserProfile,
  toggleFollowUser,
  checkMutualFollow,
  getChatId,
  sendMessage,
  subscribeToChat,
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  createEmergencyAlert,
  updateEmergencyAlertStatus,
  uploadFile,
  subscribeToUserProfile,
  subscribeToEmergencyAlerts,
  subscribeToUserChats,
  initializeUserProfile,
};

export default firebaseServices;

// Removed the conflicting local deleteDoc function declaration
