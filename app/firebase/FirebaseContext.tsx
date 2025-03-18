// firebase/FirebaseContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { User } from './firebaseServices';

interface FirebaseContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

interface FirebaseProviderProps {
  children: ReactNode;
}

const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (!authUser) {
        setUserData(null);
        setLoading(false);
        return;
      }
      
      try {
        // Get user data from Firestore and set up real-time listener
        const userRef = doc(db, 'users', authUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            setUserData({
              id: docSnapshot.id,
              ...docSnapshot.data(),
            } as User);
          } else {
            console.log('No user data found in Firestore');
          }
          setLoading(false);
        });
        
        return () => unsubscribeSnapshot();
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    });
    
    return () => unsubscribeAuth();
  }, []);

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        setUserData({
          id: userDoc.id,
          ...userDoc.data(),
        } as User);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <FirebaseContext.Provider 
      value={{ 
        user, 
        userData, 
        loading,
        refreshUserData
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

// Add default export
export default FirebaseProvider;