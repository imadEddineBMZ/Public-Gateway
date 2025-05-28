"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Types pour l'historique des dons
type DonationStatus = "completed" | "cancelled" | "pending"
type Donation = {
  id: string
  date: string
  hospital: string
  bloodType: string
  status: DonationStatus
}

export function DonationHistory() {
  // Données simulées pour l'historique des dons
  const [donations, setDonations] = useState<Donation[]>([
    {
      id: "don-001",
      date: "2024-03-15",
      hospital: "Hôpital Central",
      bloodType: "O+",
      status: "completed",
    },
    {
      id: "don-002",
      date: "2023-12-10",
      hospital: "Clinique El Azhar",
      bloodType: "O+",
      status: "completed",
    },
    {
      id: "don-003",
      date: "2023-09-05",
      hospital: "Hôpital Universitaire",
      bloodType: "O+",
      status: "cancelled",
    },
  ])

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusBadgeVariant = (status: DonationStatus) => {
    switch (status) {
      case "completed":
        return "success"
      case "cancelled":
        return "destructive"
      case "pending":
        return "default"
      default:
        return "default"
    }
  }

  // Fonction pour obtenir le texte du statut en français
  const getStatusText = (status: DonationStatus) => {
    switch (status) {
      case "completed":
        return "Complété"
      case "cancelled":
        return "Annulé"
      case "pending":
        return "En attente"
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
          <CardTitle>Historique des dons</CardTitle>
          <CardDescription>Vos dons de sang précédents</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {donations.length === 0 ? (
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
              <p className="text-gray-500">Vous n'avez pas encore effectué de don.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-medium">ID</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium">Hôpital</TableHead>
                    <TableHead className="font-medium">Groupe sanguin</TableHead>
                    <TableHead className="font-medium">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation, index) => (
                    <TableRow key={donation.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{donation.id}</TableCell>
                      <TableCell>{new Date(donation.date).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>{donation.hospital}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-hero-red text-xs font-semibold">
                            {donation.bloodType}
                          </div>
                          <span>{donation.bloodType}</span>
                        </div>
                      </TableCell>
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
