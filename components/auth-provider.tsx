"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ApplicationUserDTO, UpdateProfileRequest, UpdateUserDTO } from "@/client/models";
import { createAuthenticatedClient } from "@/services/api/core";
import { register as apiRegister } from "@/services/api/auth/auth-service";
import { getWilayas } from "@/services/api/locations/locations-service";
import Cookies from "js-cookie";

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
  donorBloodGroup?: number;
  wilaya?: string;
  wilayaId?: number;
  commune?: {
    id: number;
    name: string;
    wilayaId: number;
  } | null;
  communeId?: number | null;

  // Donor specific fields
  donorCorrelationId?: string | null;
  donorWantToStayAnonymous?: boolean | null;
  donorExcludeFromPublicPortal?: boolean | null;
  donorAvailability?: number | null;
  donorContactMethod?: number | null;
  donorName?: string | null;
  donorBirthDate?: string | null;
  donorNIN?: string | null;
  donorTel?: string | null;
  donorNotesForBTC?: string | null;
  donorLastDonationDate?: string | null;

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
  // Add the register method
  register: (userData: any) => Promise<void>;
  // Add the login method
  login: (email: string, password: string) => Promise<boolean>;
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
  // Add default implementation
  register: async () => {},
  // Add default implementation for login
  login: async () => false,
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
          const parsedUser = JSON.parse(storedUser);
          
          // If we have communeId and wilayaId but no wilaya name, fetch it
          if (parsedUser.commune?.wilayaId && !parsedUser.wilaya) {
            (async () => {
              const wilayaName = await fetchWilayaName(parsedUser.commune.wilayaId);
              parsedUser.wilaya = wilayaName;
              localStorage.setItem("user", JSON.stringify(parsedUser));
              setUser(parsedUser);
            })();
          } else {
            setUser(parsedUser);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse stored user data", e);
      if (typeof window !== 'undefined') {
        localStorage.removeItem("user");
      }
    }
    
    setIsLoading(false);
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
        
        // Also remove the auth cookie
        Cookies.remove('auth_token');
        
        console.log("[AUTH] Local storage and cookies cleared");
        
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
        // Update user data with the new profile data
        const updatedUser = { ...user! };
        
        // Update fields from profile data
        Object.keys(profileData).forEach(key => {
          (updatedUser as any)[key] = profileData[key as keyof typeof profileData] ?? (updatedUser as any)[key];
        });
        
        // If communeId is updated, also update wilayaId
        if ('communeId' in profileData && profileData.communeId) {
          // Fetch commune to get wilayaId
          try {
            const communeResponse = await fetch(`https://localhost:57679/communes/details/${profileData.communeId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${user!.token}`,
                'Accept': 'application/json',
              }
            });
            
            if (communeResponse.ok) {
              const communeData = await communeResponse.json();
              if (communeData && communeData.wilayaId) {
                updatedUser.wilayaId = communeData.wilayaId;
                
                // Get wilaya name
                const wilayaName = await fetchWilayaName(communeData.wilayaId);
                updatedUser.wilaya = wilayaName;
              }
            }
          } catch (error) {
            console.error("[AUTH] Error fetching commune details:", error);
          }
        }
        
        // Update state and localStorage
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("[AUTH] Error updating profile:", error);
      return false;
    }
  };

  // Add the register function
  const register = async (userData: any) => {
    try {
      console.log("[AUTH] Starting registration with data:", userData);
      
      // Call the API register function
      await apiRegister(userData);
      
      // Show success message
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      });
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error("[AUTH] Registration error:", error);
      throw error;
    }
  };

  // Replace the login function with this implementation

  const login = async (email: string, password: string) => {
    try {
      console.log("[AUTH] Attempting login with:", email);
      
      // Make the login API call
      const response = await fetch("https://localhost:57679/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("[AUTH] Login response data:", data);
      
      if (data.jwToken) {
        // Store initial basic user data with token
        const initialUserData = {
          id: data.userId,
          name: data.userDTO?.name || email.split('@')[0],
          email: email,
          token: data.jwToken,
          donorNIN: data.userDTO?.donorNIN || null
        };
        
        console.log("[AUTH] Initial user data saved:", initialUserData);
        
        // Temporarily store in localStorage (will be replaced with complete data)
        localStorage.setItem("user", JSON.stringify(initialUserData));
        
        // Also set a cookie with the token
        Cookies.set('auth_token', data.jwToken, { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Now fetch all users to find the complete user data
        console.log("[AUTH] Fetching users to find complete user data");
        const usersResponse = await fetch(`https://localhost:57679/users?loggedUserId=${initialUserData.id}&level=1`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${data.jwToken}`,
            "Accept": "application/json"
          }
        });
        
        if (!usersResponse.ok) {
          throw new Error(`Failed to fetch users: ${usersResponse.status}`);
        }
        
        const usersData = await usersResponse.json();
        console.log("[AUTH] Received users data, searching for match");
        
        let matchedUser = null;
        
        // First try to match by NIN if available
        if (data.userDTO?.donorNIN) {
          matchedUser = usersData.users.find(
            (user: any) => user.donorNIN === data.userDTO.donorNIN
          );
          
          if (matchedUser) {
            console.log("[AUTH] Found exact NIN match:", matchedUser.donorNIN);
          }
        }
        
        // If no match by NIN, try other identifiers as fallback
        if (!matchedUser) {
          matchedUser = usersData.users.find(
            (user: any) => 
              user.id === data.userId || 
              user.email === email
          );
          
          if (matchedUser) {
            console.log("[AUTH] Found user match by ID/email");
          }
        }
        
        // If still no match, use the first user as last resort
        if (!matchedUser && usersData.users.length > 0) {
          console.warn("[AUTH] Couldn't find exact match, using first user");
          matchedUser = usersData.users[0];
        }
        
        if (matchedUser) {
          // Extract the wilaya name and ID if available
          let wilayaName = "Unknown";
          let wilayaId = undefined;
          
          if (matchedUser.commune?.wilayaId) {
            wilayaId = matchedUser.commune.wilayaId;
            wilayaName = await fetchWilayaName(wilayaId);
            console.log(`[AUTH] Found wilayaId: ${wilayaId}, name: ${wilayaName}`);
          }
          
          // Create the complete user object with all available data
          const completeUser = {
            id: data.userId,
            // Always use donorName as the primary source for name if available
            name: matchedUser.donorName || data.userDTO?.name || email.split('@')[0],
            email: email,
            token: data.jwToken,
            donorBloodGroup: matchedUser.donorBloodGroup,
            bloodType: matchedUser.donorBloodGroup ? 
              mapBloodGroupToString(matchedUser.donorBloodGroup) : undefined,
            
            // Location data
            wilayaId: wilayaId,
            wilaya: wilayaName,
            communeId: matchedUser.communeId,
            commune: matchedUser.commune,
            
            // Donor specific fields
            donorCorrelationId: matchedUser.donorCorrelationId,
            donorName: matchedUser.donorName, // This should match the name field above
            donorBirthDate: matchedUser.donorBirthDate,
            donorNIN: matchedUser.donorNIN,
            donorTel: matchedUser.donorTel,
            donorWantToStayAnonymous: matchedUser.donorWantToStayAnonymous,
            donorExcludeFromPublicPortal: matchedUser.donorExcludeFromPublicPortal,
            donorAvailability: matchedUser.donorAvailability,
            donorContactMethod: matchedUser.donorContactMethod,
            donorNotesForBTC: matchedUser.donorNotesForBTC,
            donorLastDonationDate: matchedUser.donorLastDonationDate,
            
            // Default notification preferences
            notificationPreferences: {
              enableNotifications: true,
              emailNotifications: true,
              smsNotifications: true,
              subscribedHospitals: []
            },
            privacySettings: {
              showOnPublicList: !matchedUser.donorExcludeFromPublicPortal,
              isAnonymous: matchedUser.donorWantToStayAnonymous
            }
          };
          
          // Log the complete user data
          console.log("[AUTH] Complete user data collected:", completeUser);
          
          // Save to localStorage and state
          localStorage.setItem("user", JSON.stringify(completeUser));
          setUser(completeUser);
          
          return true;
        } else {
          console.error("[AUTH] No matching user found in users list");
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error("[AUTH] Login error:", error);
      toast({
        title: "Erreur de connexion",
        description: "Identifiants invalides ou erreur de serveur. Veuillez réessayer.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update the fetchCompleteUserData function

  const fetchCompleteUserData = async (token: string) => {
    try {
      console.log("[AUTH] Fetching complete user data");
      
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = currentUser.id;
      
      // Log the user ID for debugging
      console.log("[AUTH] User ID being used for data fetch:", userId);
      
      if (!userId) {
        console.error("[AUTH] No user ID available for fetching data");
        return;
      }
      
      // Add loggedUserId parameter to the API call
      const response = await fetch(`https://localhost:57679/users?loggedUserId=${userId}&level=1`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("[AUTH] Received users data:", data);
      
      if (data && data.users && data.users.length > 0) {
        // Look for user by NIN first - PRIORITIZE THIS as requested
        let userData = null;
        
        // Even if currentUser.donorNIN doesn't exist yet, check all users
        // Check through all users first for NIN match
        for (const user of data.users) {
          // If we have a donorNIN to match against, prioritize that
          if (currentUser.donorNIN && user.donorNIN === currentUser.donorNIN) {
            userData = user;
            console.log("[AUTH] Found exact NIN match:", user.donorNIN);
            break;
          }
        }
        
        // If no match by NIN, try other identifiers as fallback
        if (!userData) {
          for (const user of data.users) {
            if (user.id === userId || 
                user.email === currentUser.email || 
                user.donorCorrelationId === userId) {
              userData = user;
              console.log("[AUTH] Found user match by ID/email:", user);
              break;
            }
          }
        }
        
        // If no match found, try commune matching as fallback
        if (!userData && currentUser.communeId) {
          userData = data.users.find((user: { communeId: any; }) => user.communeId === currentUser.communeId);
          if (userData) {
            console.log("[AUTH] Found user by commune match:", userData);
          }
        }
        
        // If still not found, use first user as last resort
        if (!userData) {
          console.warn("[AUTH] Couldn't find exact user match, using first user");
          userData = data.users[0];
        }
        
        if (userData) {
          // Extract the wilaya name from the wilayaId if commune exists
          let wilayaName = "Unknown";
          let wilayaId = undefined;
          
          // Log the commune data to help debug
          console.log("[AUTH] User commune data:", userData.commune);
          
          if (userData.commune?.wilayaId) {
            wilayaId = userData.commune.wilayaId;
            console.log(`[AUTH] Found wilayaId: ${wilayaId}, fetching name`);
            
            try {
              wilayaName = await fetchWilayaName(wilayaId);
              console.log(`[AUTH] Found wilaya name: ${wilayaName}`);
            } catch (error) {
              console.error(`[AUTH] Error fetching wilaya name:`, error);
              // Set a fallback name based on ID
              wilayaName = `Wilaya ${wilayaId}`;
            }
          } else if (userData.communeId) {
            // If we have communeId but no wilaya info, try to fetch it directly
            console.log(`[AUTH] No wilayaId in commune object, trying to fetch for communeId: ${userData.communeId}`);
            try {
              const communeResponse = await fetch(`https://localhost:57679/communes/details/${userData.communeId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                }
              });
              
              if (communeResponse.ok) {
                const communeData = await communeResponse.json();
                if (communeData && communeData.wilayaId) {
                  wilayaId = communeData.wilayaId;
                  wilayaName = await fetchWilayaName(wilayaId);
                  console.log(`[AUTH] Found wilayaId ${wilayaId} with name ${wilayaName} from commune details`);
                }
              }
            } catch (error) {
              console.error("[AUTH] Error fetching commune details:", error);
            }
          }
          
          const completeUser = {
            ...currentUser,
            // Add all the fields from the API response
            donorCorrelationId: userData.donorCorrelationId,
            donorName: userData.donorName,
            donorBirthDate: userData.donorBirthDate,
            donorBloodGroup: userData.donorBloodGroup,
            donorNIN: userData.donorNIN,
            donorTel: userData.donorTel,
            donorWantToStayAnonymous: userData.donorWantToStayAnonymous,
            donorExcludeFromPublicPortal: userData.donorExcludeFromPublicPortal,
            donorAvailability: userData.donorAvailability,
            donorContactMethod: userData.donorContactMethod,
            donorNotesForBTC: userData.donorNotesForBTC,
            donorLastDonationDate: userData.donorLastDonationDate,
            communeId: userData.communeId,
            commune: userData.commune,
            wilayaId: wilayaId, // Store the wilayaId explicitly
            wilaya: wilayaName  // Set the wilaya name directly
          };
          
          // Update localStorage with complete user data
          localStorage.setItem("user", JSON.stringify(completeUser));
          
          // Update state
          setUser(completeUser);
          
          console.log(`[AUTH] User data updated with wilayaId: ${wilayaId}, wilaya: ${wilayaName}`);
        }
      }
    } catch (error) {
      console.error("[AUTH] Error fetching complete user data:", error);
    }
  };

  // Add this function to fetch wilaya name

  const fetchWilayaName = async (wilayaId: number): Promise<string> => {
    try {
      // Use direct fetch or the existing getWilayas function
      const wilayasData = await getWilayas();
      
      // Find the wilaya with the matching ID
      const wilaya = wilayasData.find(w => w.id === wilayaId);
      return wilaya?.name || "Unknown";
    } catch (error) {
      console.error(`[AUTH] Error fetching wilaya name for ID ${wilayaId}:`, error);
      return "Unknown";
    }
  };

  // Update the provider value to include the register method
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
      updateProfile,
      register,  // Add the register method here
      login  // Add the login method here
    }}>
      {children}
    </AuthContext.Provider>
  );
};
