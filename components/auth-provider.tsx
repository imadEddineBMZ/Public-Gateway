"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ApplicationUserDTO, UpdateProfileRequest, UpdateUserDTO } from "@/client/models";
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
  updateProfile: (profileData: Partial<UpdateUserDTO>) => Promise<boolean>;
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
  updateProfile: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

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
        } else {
          // Only set demo user if no real user exists in localStorage
          // DEMO USER CODE - FOR DEVELOPMENT ONLY
          const userData = {
            donorCorrelationId: null,
            donorWantToStayAnonymous: false,
            donorExcludeFromPublicPortal: false,
            donorAvailability: 1,
            donorContactMethod: 1,
            donorName: "Hiki Belamdi",
            donorBirthDate: "2023-02-02T00:00:00Z",
            donorBloodGroup: 1,
            donorNIN: "125555879123412345",
            donorTel: "0778332551",
            donorNotesForBTC: "",
            donorLastDonationDate: null,
            communeId: 555
          };
          
          // Create the complete user object
          const completeUser: User = {
            id: "userId",
            name: userData.donorName || "Utilisateur",
            email: "hikihiki@example.com",
            token: "token",
            bloodType: userData.donorBloodGroup 
              ? mapBloodGroupToString(userData.donorBloodGroup) 
              : undefined,
            donorBloodGroup: userData.donorBloodGroup,
            wilaya: undefined,
            donorCorrelationId: userData.donorCorrelationId || undefined,
            donorWantToStayAnonymous: userData.donorWantToStayAnonymous || false,
            donorExcludeFromPublicPortal: userData.donorExcludeFromPublicPortal || false,
            donorAvailability: userData.donorAvailability,
            donorContactMethod: userData.donorContactMethod,
            donorName: userData.donorName,
            donorBirthDate: userData.donorBirthDate,
            donorNIN: userData.donorNIN,
            donorTel: userData.donorTel,
            donorNotesForBTC: userData.donorNotesForBTC,
            donorLastDonationDate: userData.donorLastDonationDate || undefined,
            communeId: userData.communeId,
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
          
          // Update state and localStorage
          setUser(completeUser);
          localStorage.setItem("user", JSON.stringify(completeUser));
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
  }, []); // Empty dependency array means this runs once on mount

  // Function to fetch complete user data from API
  const fetchUserData = async (userId: string, token: string) => {
    try {
      // Create authenticated client with the token
      const client = createAuthenticatedClient(token);
      
      // Fetch user data from API
      const response = await client.user.get({
        queryParameters: {
          userId: userId
        }
      });
      
      if (response?.user) {
        // Explicitly type the user data from response
        const userData: ApplicationUserDTO = response.user;
        
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

          wilaya: undefined, // userData doesn't have wilaya property

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
        
        // Update state and localStorage
        setUser(completeUser);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(completeUser));
        }
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

  /**
   * Updates the donor profile using the API
   * @param profileData Object containing profile data to update
   * @returns Promise that resolves when the profile is updated
   */
  const updateProfile = async (profileData: Partial<UpdateUserDTO>): Promise<boolean> => {
    if (!user?.token) {
      console.error("[AUTH] No user token available for profile update");
      return false;
    }

    try {
      console.log("[AUTH] Starting profile update with data:", profileData);
      
      // Use fetch directly for better debugging
      const response = await fetch(`https://localhost:57679/donor/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      console.log("[AUTH] Profile update HTTP status:", response.status);
      
      // Read the response text for debugging
      const responseText = await response.text();
      console.log("[AUTH] Raw response:", responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${responseText}`);
      }
      
      // Parse the response if not empty
      let responseData;
      try {
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log("[AUTH] Parsed response data:", responseData);
        }
      } catch (e) {
        console.warn("[AUTH] Could not parse response as JSON:", e);
      }
      
      // Even without response data, we should update our user state
      if (response.ok) {
        // Create a copy of the current user object
        const updatedUser = { ...user! };
        
        // Update only the fields that were in the profileData
        Object.keys(profileData).forEach(key => {
          // Use type assertion to safely update fields
          (updatedUser as any)[key] = profileData[key as keyof typeof profileData] ?? (updatedUser as any)[key];
        });
        
        // Explicitly handle communeId to ensure it's always included
        if ('communeId' in profileData) {
          updatedUser.communeId = profileData.communeId ?? user!.communeId;
          console.log("[AUTH] Explicitly updated communeId:", updatedUser.communeId);
        }
        
        // Update derived fields
        if (profileData.donorBloodGroup) {
          updatedUser.bloodType = mapBloodGroupToString(profileData.donorBloodGroup);
        }
        
        console.log("[AUTH] Updated user object with communeId:", updatedUser.communeId);
        
        // Update state
        setUser(updatedUser);
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem("user", JSON.stringify(updatedUser));
            // Add debugging to verify localStorage contains communeId
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            console.log("[AUTH] Verified communeId in localStorage:", stored.communeId);
          } catch (e) {
            console.error("[AUTH] Error saving to localStorage:", e);
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("[AUTH] Error updating profile:", error);
      return false;
    }
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
      unsubscribeFromHospital,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
