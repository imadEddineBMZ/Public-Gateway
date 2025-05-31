"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export function DonationStatus() {
  const { user } = useAuth()
  const [localUser, setLocalUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Load user data from localStorage on component mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setLocalUser(parsedUser)
      }
    } catch (error) {
      console.error("Error loading user data from localStorage:", error)
    } finally {
      setLoading(false)
    }
  }, [user]) // Re-run when auth user changes

  // Calculate eligibility based on last donation date
  // Standard waiting period is 56 days for men, 84 days for women
  // Using 56 days as default
  const calculateEligibility = () => {
    // Use data from multiple possible sources
    const lastDonationDate = localUser?.donorLastDonationDate || 
                             localUser?.lastDonation || 
                             user?.donorLastDonationDate

    if (!lastDonationDate) return { isEligible: true, eligibleDate: null }

    const lastDonation = new Date(lastDonationDate)
    const today = new Date()
    
    // Add 56 days to last donation date
    const eligibleDate = new Date(lastDonation)
    eligibleDate.setDate(lastDonation.getDate() + 56)
    
    // Check if eligible date has passed
    const isEligible = today >= eligibleDate
    
    return { isEligible, eligibleDate }
  }

  const { isEligible, eligibleDate } = calculateEligibility()

  // Calculate days remaining until eligibility
  const calculateDaysRemaining = () => {
    if (!eligibleDate || isEligible) return null

    const today = new Date()
    const diffTime = Math.abs(eligibleDate.getTime() - today.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const daysRemaining = calculateDaysRemaining()
  
  // Get blood type from available sources
  const getBloodType = () => {
    return localUser?.bloodType || 
           user?.bloodType || 
           mapBloodGroupToType(localUser?.donorBloodGroup) || 
           mapBloodGroupToType(user?.donorBloodGroup) || 
           "Non spécifié"
  }
  
  // Map numeric blood group to string representation
  const mapBloodGroupToType = (bloodGroup: number | undefined) => {
    if (!bloodGroup) return undefined
    
    const bloodGroupMap: Record<number, string> = {
      1: "AB+", 2: "AB-", 3: "A+", 4: "A-",
      5: "B+", 6: "B-", 7: "O+", 8: "O-"
    }
    
    return bloodGroupMap[bloodGroup]
  }
  
  // Get wilaya from available sources
  const getWilaya = () => {
    return localUser?.wilaya || user?.wilaya || "Non spécifiée"
  }
  
  // Format a date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Aucun don enregistré"
    
    try {
      return new Date(dateString).toLocaleDateString("fr-FR")
    } catch (e) {
      return "Date invalide"
    }
  }

  // Get last donation date from available sources
  // Get last donation date from available sources
  const getLastDonationDate = () => {
    const lastDonationDate = localUser?.donorLastDonationDate || 
                             localUser?.lastDonation || 
                             user?.donorLastDonationDate
    
    return formatDate(lastDonationDate)
  }
  if (loading) {
    return (
      <Card className="overflow-hidden h-full shadow-md flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-trust-blue" />
        <p className="ml-2">Chargement des données...</p>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader
          className={
            isEligible
              ? "bg-gradient-to-r from-life-green to-green-400 text-white"
              : "bg-gradient-to-r from-hero-red to-red-500 text-white"
          }
        >
          <div className="flex items-center justify-between">
            <CardTitle>Statut de don</CardTitle>
            {isEligible ? (
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                <CheckCircle className="h-4 w-4 mr-1" />
                Éligible
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                <XCircle className="h-4 w-4 mr-1" />
                Non éligible
              </Badge>
            )}
          </div>
          <CardDescription className="text-white/80">
            {isEligible
              ? "Vous êtes actuellement éligible pour donner du sang"
              : "Vous n'êtes pas encore éligible pour donner du sang"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <span className="text-sm font-medium text-gray-500">Groupe sanguin</span>
              <span className="font-semibold text-lg">{getBloodType()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <span className="text-sm font-medium text-gray-500">Dernier don</span>
              <span className="font-semibold">{getLastDonationDate()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <span className="text-sm font-medium text-gray-500">Wilaya</span>
              <span className="font-semibold">{getWilaya()}</span>
            </div>

            {!isEligible && daysRemaining && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-hero-red mt-0.5" />
                  <div>
                    <p className="font-medium">Prochain don possible dans</p>
                    <p className="text-sm text-gray-600">
                      {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} (
                      {eligibleDate ? eligibleDate.toLocaleDateString("fr-FR") : "Date inconnue"})
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
