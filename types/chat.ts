// types/chat.ts
export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'contact';
    timestamp: Date;
    type: 'text' | 'location' | 'alert' | 'status';
    metadata?: {
      location?: {
        latitude: number;
        longitude: number;
        address?: string;
      };
      alertType?: 'fall' | 'medical' | 'emergency' | 'help';
      status?: 'pending' | 'received' | 'responding' | 'resolved';
    };
  }
  
  export interface ChatPreview {
    id: string;
    contactName: string;
    lastMessage: string;
    timestamp: Date;
    unreadCount: number;
    profilePicture: string;
    status: 'online' | 'offline';
    isEmergencyContact: boolean;
    lastAlertType?: 'fall' | 'medical' | 'emergency' | 'help';
  }
  
  export interface ContactInfo {
    id: string;
    name: string;
    status: 'online' | 'offline';
    profilePicture: string;
    relationship: string;
    lastSeen?: Date;
  }