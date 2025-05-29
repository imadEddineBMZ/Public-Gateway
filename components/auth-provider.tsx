"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

// Update the User type to include subscription management
type User = {
  id: string
  name: string
  email: string
  bloodType: string,
  token?: string // Optional token for authenticated requests
  wilaya: string
  lastDonation: string | null
  eligibleDate: string | null
  points: number
  notificationPreferences: {
    enableNotifications: boolean
    subscribedHospitals: string[]
    emailNotifications: boolean
    smsNotifications: boolean
  }
  privacySettings: {
    isAnonymous: boolean
    showOnPublicList: boolean
  }
}

// Update the AuthContextType to include subscription management
type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: Partial<User> & { password: string }) => Promise<void>
  logout: () => void
  updateNotificationPreferences: (preferences: User["notificationPreferences"]) => void
  updatePrivacySettings: (settings: User["privacySettings"]) => void
  subscribeToHospital: (hospitalId: string) => void
  unsubscribeFromHospital: (hospitalId: string) => void
  setUser: (user: User) => void // Add this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      // Public paths that don't require authentication
      const publicPaths = ["/", "/login", "/register", "/donors", "/hospitals", "/requests"]
      const isPublicPath = publicPaths.includes(pathname)

      // Dashboard paths that require authentication
      const isDashboardPath = pathname.startsWith("/dashboard")

      if (!user && isDashboardPath) {
        router.push("/login")
      } else if (user && (pathname === "/login" || pathname === "/register")) {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data
      const mockUser: User = {
        id: "1",
        name: "John Doe",
        email,
        bloodType: "O+",
        wilaya: "Alger",
        lastDonation: "2024-03-15",
        eligibleDate: "2024-06-15",
        badges: ["First Save"],
        points: 100,
        notificationPreferences: {
          enableNotifications: true,
          subscribedHospitals: [],
          emailNotifications: true,
          smsNotifications: false,
        },
        privacySettings: {
          isAnonymous: false,
          showOnPublicList: true,
        },
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Calculate eligible date if lastDonation is provided
      let eligibleDate = null
      if (userData.lastDonation) {
        const lastDonationDate = new Date(userData.lastDonation)
        eligibleDate = new Date(lastDonationDate)
        eligibleDate.setMonth(eligibleDate.getMonth() + 3)
        eligibleDate = eligibleDate.toISOString().split("T")[0]
      }

      // Mock user data
      const mockUser: User = {
        id: "1",
        name: userData.name || "New User",
        email: userData.email || "",
        bloodType: userData.bloodType || "Unknown",
        wilaya: userData.wilaya || "Unknown",
        lastDonation: userData.lastDonation || null,
        eligibleDate,
        badges: [],
        points: 0,
        notificationPreferences: {
          enableNotifications: true,
          subscribedHospitals: [],
          emailNotifications: true,
          smsNotifications: false,
        },
        privacySettings: {
          isAnonymous: false,
          showOnPublicList: true,
        },
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateNotificationPreferences = (preferences: User["notificationPreferences"]) => {
    if (user) {
      const updatedUser = { ...user, notificationPreferences: preferences }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const updatePrivacySettings = (settings: User["privacySettings"]) => {
    if (user) {
      const updatedUser = { ...user, privacySettings: settings }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  // Add the new methods to the provider
  const subscribeToHospital = (hospitalId: string) => {
    if (user) {
      const updatedPreferences = {
        ...user.notificationPreferences,
        subscribedHospitals: [...user.notificationPreferences.subscribedHospitals, hospitalId],
      }
      const updatedUser = { ...user, notificationPreferences: updatedPreferences }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const unsubscribeFromHospital = (hospitalId: string) => {
    if (user) {
      const updatedPreferences = {
        ...user.notificationPreferences,
        subscribedHospitals: user.notificationPreferences.subscribedHospitals.filter((id) => id !== hospitalId),
      }
      const updatedUser = { ...user, notificationPreferences: updatedPreferences }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  // Update the provider value
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateNotificationPreferences,
        updatePrivacySettings,
        subscribeToHospital,
        unsubscribeFromHospital,
        setUser, // Add this
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
