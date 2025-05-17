import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/firebase/config";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import axios from "axios";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => { throw new Error("Not implemented"); },
  signOut: async () => { throw new Error("Not implemented"); }
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          try {
            const response = await axios.post("/api/auth/verify", { token });
            if (response.status === 200) {
              setUser(user);
            }
          } catch (verifyError: any) {
            console.error("Error verifying token:", verifyError);
            
            // Handle 404 error specifically - API route doesn't exist yet
            if (verifyError?.response?.status === 404) {
              console.warn("Auth verification endpoint not found, using Firebase auth only");
              // Still set the user to keep the app functional even without the verify endpoint
              setUser(user);
            } else {
              setError("Authentication verification failed. Please try again.");
            }
          }
        } catch (error: any) {
          console.error("Error getting ID token:", error);
          setError("Authentication error. Please try again.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User> => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setError("Failed to sign in with Google. Please try again.");
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error("Error signing out:", error);
      setError("Failed to sign out. Please try again.");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut, loading, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => useContext(AuthContext);