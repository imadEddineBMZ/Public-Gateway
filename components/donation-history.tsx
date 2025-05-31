"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fetchUserPledges } from "@/services/api/pledges/pledges-service"
import { Loader2 } from "lucide-react"

// Types pour l'historique des dons
type DonationStatus = "completed" | "cancelled" | "pending" | "active"
type Donation = {
  id: string
  date: string
  hospital: string
  bloodType: string
  status: DonationStatus
}

// Map API status to UI status
const STATUS_MAP: Record<number, DonationStatus> = {
  0: "active",     // Initiated
  1: "completed",  // Honored
  2: "cancelled",  // CanceledByInitiator
  3: "cancelled",  // CanceledByServiceNotNeeded
  4: "cancelled",  // CanceledByServiceCantBeDone
  5: "cancelled"   // CanceledTimeout
}

export function DonationHistory() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user's donation history on component mount
  useEffect(() => {
    async function loadDonations() {
      try {
        // Get user data from localStorage
        const userData = localStorage.getItem("user")
        if (!userData) {
          setIsLoading(false)
          return
        }

        const user = JSON.parse(userData)
        if (!user?.token) {
          setIsLoading(false)
          return
        }

        // Fetch donations from API
        const donationsData = await fetchUserPledges(user.token, {
          paginationTake: 10  // Limit to 10 most recent donations
        })
        
        if (donationsData && Array.isArray(donationsData)) {
          // Map API data to component format
          const mappedDonations: Donation[] = donationsData.map(donation => ({
            id: donation.id || `donation-${Math.random().toString(36).substring(7)}`,
            date: formatDate(donation.pledgeDate || donation.pledgeInitiatedDate),
            hospital: donation.bloodDonationRequest?.bloodTansfusionCenter?.name || "Hôpital",
            bloodType: mapBloodGroup(donation.bloodDonationRequest?.bloodGroup),
            status: STATUS_MAP[donation.evolutionStatus || 0] || "active",
          }))

          setDonations(mappedDonations)
        }
      } catch (error) {
        console.error("Error loading donations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDonations()
  }, [])

  // Helper function to format dates
  function formatDate(dateString?: string | Date | null): string {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
  }

  // Helper function to map blood group numbers to strings
  function mapBloodGroup(groupNumber?: number): string {
    const BLOOD_GROUP_MAP: Record<number, string> = {
      1: "AB+", 2: "AB-", 3: "A+", 4: "A-",
      5: "B+", 6: "B-", 7: "O+", 8: "O-"
    }
    return groupNumber ? BLOOD_GROUP_MAP[groupNumber] || "?" : "?"
  }

  // Function to get text for status
  const getStatusText = (status: DonationStatus) => {
    switch (status) {
      case "completed":
        return "Complété"
      case "cancelled":
        return "Annulé"
      case "active":
        return "En cours"
      default:
        return status
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full"
    >
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle>Historique des engagements</CardTitle>
          <CardDescription>Vos engagements de don de sang</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-hero-red mx-auto mb-2" />
              <p className="text-gray-500">Chargement de vos engagements...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <p className="text-gray-500">Vous n'avez pas encore d'engagements.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-medium">ID</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium">Hôpital</TableHead>
                    <TableHead className="font-medium">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{donation.id.substring(0, 8)}</TableCell>
                      <TableCell>{donation.date}</TableCell>
                      <TableCell>{donation.hospital}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            donation.status === "completed"
                              ? "outline"
                              : donation.status === "cancelled"
                                ? "destructive"
                                : "default"
                          }
                          className={cn(
                            donation.status === "completed"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : donation.status === "cancelled"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-blue-100 text-blue-800 border-blue-200",
                          )}
                        >
                          {getStatusText(donation.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
