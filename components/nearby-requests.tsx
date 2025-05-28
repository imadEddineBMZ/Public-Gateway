"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin } from "lucide-react"
import { motion } from "framer-motion"

// Types pour les demandes de sang
type RequestUrgency = "critical" | "urgent" | "standard"
type BloodRequest = {
  id: string
  hospitalName: string
  bloodType: string
  urgency: RequestUrgency
  deadline: string
  location: string
  distance: number
}

export function NearbyRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<BloodRequest[]>([
    {
      id: "req-001",
      hospitalName: "Hôpital Central",
      bloodType: "O+",
      urgency: "critical",
      deadline: "2024-05-25",
      location: "Alger",
      distance: 2.5,
    },
    {
      id: "req-002",
      hospitalName: "Clinique El Azhar",
      bloodType: "A+",
      urgency: "urgent",
      deadline: "2024-05-30",
      location: "Alger",
      distance: 4.8,
    },
    {
      id: "req-003",
      hospitalName: "Hôpital Universitaire",
      bloodType: "B-",
      urgency: "standard",
      deadline: "2024-06-10",
      location: "Alger",
      distance: 7.2,
    },
  ])

  // Filtrer les demandes compatibles avec le type de sang de l'utilisateur
  const compatibleRequests = requests.filter((request) => {
    // Logique simplifiée de compatibilité des groupes sanguins
    if (!user?.bloodType) return true
    if (request.bloodType === user.bloodType) return true
    if (user.bloodType === "O-") return true
    if (user.bloodType === "O+" && ["O+", "A+", "B+", "AB+"].includes(request.bloodType)) return true
    return false
  })

  // Fonction pour obtenir la couleur du badge en fonction de l'urgence
  const getUrgencyBadgeVariant = (urgency: RequestUrgency) => {
    switch (urgency) {
      case "critical":
        return "destructive"
      case "urgent":
        return "default"
      case "standard":
        return "outline"
      default:
        return "outline"
    }
  }

  // Fonction pour obtenir le texte de l'urgence en français
  const getUrgencyText = (urgency: RequestUrgency) => {
    switch (urgency) {
      case "critical":
        return "Critique"
      case "urgent":
        return "Urgent"
      case "standard":
        return "Standard"
      default:
        return urgency
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <CardHeader className="bg-gradient-to-r from-trust-blue to-blue-600 text-white">
          <CardTitle>Demandes à proximité</CardTitle>
          <CardDescription className="text-blue-100">
            Demandes de sang compatibles dans votre wilaya ({user?.wilaya || "Non spécifiée"})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <div className="divide-y">
            {compatibleRequests.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Aucune demande compatible trouvée dans votre région.</p>
              </div>
            ) : (
              compatibleRequests.slice(0, 3).map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{request.hospitalName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {request.location} ({request.distance} km)
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={getUrgencyBadgeVariant(request.urgency)}
                      className={
                        request.urgency === "critical"
                          ? "bg-alert-coral text-white border-alert-coral animate-pulse"
                          : request.urgency === "urgent"
                            ? "bg-hero-red text-white border-hero-red"
                            : ""
                      }
                    >
                      {getUrgencyText(request.urgency)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center text-hero-red font-semibold shadow-sm">
                        {request.bloodType}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>Jusqu'au {new Date(request.deadline).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-hero-red hover:bg-red-50 hover:text-hero-red">
                      Détails
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-gray-50 mt-auto">
          <Link href="/dashboard/requests" className="w-full">
            <Button variant="outline" className="w-full hover:bg-trust-blue hover:text-white transition-colors">
              Voir toutes les demandes
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
