"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ApplicationUserDTO } from "@/client/models";
import { createAuthenticatedClient } from "@/services/api/core";

// Add these types first to make TypeScript happy
type NotificationSettings = {
  enableNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  subscribedHospitals: string[];
}

type PrivacySettings = {
  showOnPublicList: boolean;
  isAnonymous: boolean;
}

// Update User type to include these settings properly
type User = {
  id: string;
  name: string;
  email: string;
  token: string;
  bloodType?: string;
  wilaya?: string;
  
  // Donor specific fields
  donorCorrelationId?: string;
  donorWantToStayAnonymous?: boolean;
  donorExcludeFromPublicPortal?: boolean;
  donorAvailability?: number;
  donorContactMethod?: number;
  donorName?: string;
  donorBirthDate?: string;
  donorBloodGroup?: number;
  donorNIN?: string;
  donorTel?: string;
  donorNotesForBTC?: string;
  donorLastDonationDate?: string;
  communeId?: number;

  // Add proper typing for these notification-related fields
  notificationPreferences?: NotificationSettings;
  privacySettings?: PrivacySettings;
} | null;

type AuthContextType = {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  fetchUserData: (userId: string, token: string) => Promise<void>;
  // Add these method definitions with proper types
  updateNotificationPreferences: (preferences: NotificationSettings) => void;
  updatePrivacySettings: (settings: PrivacySettings) => void;
  unsubscribeFromHospital: (hospitalId: string) => void;
};

// Make sure the context default value has these methods
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  isLoading: true,
  fetchUserData: async () => {},
  // Add default implementations
  updateNotificationPreferences: () => {},
  updatePrivacySettings: () => {},
  unsubscribeFromHospital: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Function to fetch complete user data from API
  const fetchUserData = async (userId: string, token: string) => {
    console.log(`[AUTH] Starting fetchUserData for userId: ${userId}`);
    try {
      // Create authenticated client with the token
      const client = createAuthenticatedClient(token);
      
      console.log(`[AUTH] Fetching user data from /user endpoint with userId: ${userId}`);
      // Fetch user data from API
      const response = await client.user.get({
        queryParameters: {
          userId: userId
        }
      });
      
      console.log(`[AUTH] User data response received:`, response);
      
      if (response?.user) {
        // Explicitly type the user data from response
        const userData: ApplicationUserDTO = response.user;
        
        console.log(`[AUTH] Processing user data:`, userData);
        
        // Use donorCorrelationId as the primary ID when available
        const primaryId = userData.donorCorrelationId || userId;
        
        // Create a complete user object with API data and token
        const completeUser: User = {
          id: primaryId,
          name: userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`
            : userData.username || "Utilisateur",
          email: userData.email || "",
          token: token,

          // Use numeric donorBloodGroup for blood type
          bloodType: userData.donorBloodGroup
            ? mapBloodGroupToString(userData.donorBloodGroup)
            : undefined,
          donorBloodGroup: userData.donorBloodGroup || undefined,

          wilaya: userData.wilaya?.name,

          // Map all donor fields from the API response
          donorCorrelationId: userData.donorCorrelationId || undefined,
          donorWantToStayAnonymous: userData.donorWantToStayAnonymous || false,
          donorExcludeFromPublicPortal: userData.donorExcludeFromPublicPortal || false,
          donorAvailability: userData.donorAvailability || undefined,
          donorContactMethod: userData.donorContactMethod || undefined,
          donorName: userData.donorName || undefined,
          donorBirthDate: userData.donorBirthDate ? new Date(userData.donorBirthDate).toISOString() : undefined,
          donorNIN: userData.donorNIN || undefined,
          donorTel: userData.donorTel || undefined,
          donorNotesForBTC: userData.donorNotesForBTC || undefined,
          donorLastDonationDate: userData.donorLastDonationDate ? new Date(userData.donorLastDonationDate).toISOString() : undefined,
          communeId: userData.communeId || undefined,
          notificationPreferences: {
            enableNotifications: true,
            emailNotifications: true,
            smsNotifications: true,
            subscribedHospitals: []
          },
          privacySettings: {
            showOnPublicList: true,
            isAnonymous: false
          }
        };
        
        console.log(`[AUTH] User data processing complete. Updated user object:`, completeUser);
        
        // Update state and localStorage
        setUser(completeUser);
        
        if (typeof window !== 'undefined') {
          console.log(`[AUTH] Storing user data in localStorage`);
          localStorage.setItem("user", JSON.stringify(completeUser));
        }
        
        console.log(`[AUTH] fetchUserData completed successfully`);
      } else {
        console.log(`[AUTH] No user data found in the response`);
      }
    } catch (error) {
      console.error("[AUTH] Error fetching user data:", error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger vos informations complètes. Certaines fonctionnalités pourraient être limitées.",
        variant: "destructive",
      });
    }
  };

  // Helper function to map numeric blood group to string
  const mapBloodGroupToString = (bloodGroupId: number): string => {
    const BLOOD_GROUP_MAP: Record<number, string> = {
      1: "AB+",
      2: "AB-",
      3: "A+",
      4: "A-",
      5: "B+",
      6: "B-",
      7: "O+",
      8: "O-"
    };
    return BLOOD_GROUP_MAP[bloodGroupId] || "Inconnu";
  };

  // Check for stored user data on component mount
  useEffect(() => {
    try {
      // Only access localStorage on the client side
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (e) {
      console.error("Failed to parse stored user data", e);
      if (typeof window !== 'undefined') {
        localStorage.removeItem("user");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enhanced logout function with logging
  const logout = () => {
    console.log("[AUTH] Starting logout process");
    try {
      if (typeof window !== 'undefined') {
        console.log("[AUTH] Clearing user state and localStorage");
        // Clear user from state
        setUser(null);
        
        // Remove all auth-related items from localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("auth_state");
        
        // Clear any session storage items too
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        
        console.log("[AUTH] Local storage cleared");
        
        // Show success toast
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès.",
          className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
        });
        
        console.log("[AUTH] Redirecting to home page");
        // Redirect to home or login page
        router.push('/');
        
        console.log("[AUTH] Logout completed successfully");
      }
    } catch (error) {
      console.error("[AUTH] Error during logout:", error);
      toast({
        title: "Erreur lors de la déconnexion",
        description: "Une erreur est survenue lors de la déconnexion. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Add these new methods
  const updateNotificationPreferences = (preferences: NotificationSettings) => {
    if (!user) return;
    
    // Update user state with new preferences
    setUser({
      ...user,
      notificationPreferences: preferences
    });
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem("user", JSON.stringify({
          ...parsedUser,
          notificationPreferences: preferences
        }));
      }
    }
    
    // Here you would typically make an API call to update preferences on the server
    // Example: updateUserPreferencesApi(user.id, preferences);
  };
  
  const updatePrivacySettings = (settings: PrivacySettings) => {
    if (!user) return;
    
    // Update user state with new settings
    setUser({
      ...user,
      privacySettings: settings
    });
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem("user", JSON.stringify({
          ...parsedUser,
          privacySettings: settings
        }));
      }
    }
    
    // Here you would typically make an API call to update settings on the server
    // Example: updateUserPrivacyApi(user.id, settings);
  };
  
  const unsubscribeFromHospital = (hospitalId: string) => {
    // Here you would typically make an API call to unsubscribe from a hospital
    // Example: unsubscribeFromHospitalApi(user.id, hospitalId);
    
    // For now, just console.log
    console.log(`Unsubscribing from hospital ${hospitalId}`);
  };

  // Update the provider value to include the new methods
  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      logout, 
      isLoading, 
      fetchUserData,
      updateNotificationPreferences,
      updatePrivacySettings,
      unsubscribeFromHospital
    }}>
      {children}
    </AuthContext.Provider>
  );
};
