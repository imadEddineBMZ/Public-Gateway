"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"

export function DonationStatus() {
  const { user } = useAuth()

  // Déterminer si l'utilisateur est éligible pour donner du sang
  const isEligible = user?.eligibleDate ? new Date(user.eligibleDate) <= new Date() : user?.lastDonation ? false : true

  // Calculer le temps restant jusqu'à l'éligibilité
  const calculateTimeRemaining = () => {
    if (!user?.eligibleDate || isEligible) return null

    const today = new Date()
    const eligibleDate = new Date(user.eligibleDate)
    const diffTime = Math.abs(eligibleDate.getTime() - today.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const daysRemaining = calculateTimeRemaining()

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
              <span className="font-semibold text-lg">{user?.bloodType || "Non spécifié"}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <span className="text-sm font-medium text-gray-500">Dernier don</span>
              <span className="font-semibold">
                {user?.lastDonation ? new Date(user.lastDonation).toLocaleDateString("fr-FR") : "Aucun don enregistré"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <span className="text-sm font-medium text-gray-500">Wilaya</span>
              <span className="font-semibold">{user?.wilaya || "Non spécifiée"}</span>
            </div>

            {!isEligible && daysRemaining && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-hero-red mt-0.5" />
                  <div>
                    <p className="font-medium">Prochain don possible dans</p>
                    <p className="text-sm text-gray-600">
                      {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} (
                      {user?.eligibleDate ? new Date(user.eligibleDate).toLocaleDateString("fr-FR") : "Date inconnue"})
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
