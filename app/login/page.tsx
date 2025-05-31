"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { login as apiLogin } from "@/services/api-service"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function LoginPage() {
  const { setUser } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("[LOGIN] Attempting login with:", email)
      
      // Use enhanced login API function
      const { token, userData, userId } = await apiLogin(email, password)
      
      console.log("[LOGIN] Login successful, processing user data")
      
      // Map blood group to string representation
      const bloodType = userData?.donorBloodGroup ? mapBloodGroupToString(userData.donorBloodGroup) : undefined
      
      // Create a complete user object directly from login response
      const completeUser = {
        id: userId,
        name: userData?.donorName || email.split('@')[0],
        email,
        token,
        bloodType,
        
        // Add all the donor-specific fields
        donorCorrelationId: userData?.donorCorrelationId,
        donorWantToStayAnonymous: userData?.donorWantToStayAnonymous || false,
        donorExcludeFromPublicPortal: userData?.donorExcludeFromPublicPortal || false,
        donorAvailability: userData?.donorAvailability,
        donorContactMethod: userData?.donorContactMethod,
        donorName: userData?.donorName,
        donorBirthDate: userData?.donorBirthDate,
        donorBloodGroup: userData?.donorBloodGroup,
        donorNIN: userData?.donorNIN,
        donorTel: userData?.donorTel,
        donorNotesForBTC: userData?.donorNotesForBTC,
        donorLastDonationDate: userData?.donorLastDonationDate,
        communeId: userData?.communeId,
        
        // Add default notification and privacy settings
        notificationPreferences: {
          enableNotifications: true,
          emailNotifications: true,
          smsNotifications: true,
          subscribedHospitals: []
        },
        privacySettings: {
          showOnPublicList: !userData?.donorExcludeFromPublicPortal,
          isAnonymous: userData?.donorWantToStayAnonymous || false
        },
        
        // Add wilaya information if available
        wilaya: userData?.wilaya?.name,
      }
      
      // Update user context
      setUser(completeUser)
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(completeUser))
      }
      
      console.log("[LOGIN] User data processed and stored, redirecting to dashboard")
      
      // Navigate to dashboard
      router.push("/dashboard")
      
    } catch (error) {
      console.error("[LOGIN] Login failed:", error)
      setError("Identifiants invalides. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }
  
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
    }
    return BLOOD_GROUP_MAP[bloodGroupId] || "Inconnu"
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white to-red-50">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-trust-blue hover:text-hero-red transition-colors">
          <div className="w-8 h-8 bg-hero-red rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-white"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="font-bold">DonorConnect</span>
        </Link>
      </div>

      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-red-200/30 to-transparent rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-red-200/30 to-transparent rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 relative">
            <div className="blood-drop absolute inset-0"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">+</div>
          </div>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-trust-blue">Connexion</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder à votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="#" className="text-sm text-hero-red hover:underline">
                    Mot de passe oublié?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-hero-red hover:bg-hero-red/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Vous n'avez pas de compte?{" "}
              <Link href="/register" className="text-hero-red hover:underline">
                S'inscrire
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

