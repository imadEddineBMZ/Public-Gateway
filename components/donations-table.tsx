"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Download, Eye, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

// Types pour les données
type Donation = {
  id: string
  date: string
  center: string
  bloodType: string
  volume: number
  status: "completed" | "processing" | "rejected"
  certificate: string
}

export function DonationsTable() {
  const [searchTerm, setSearchTerm] = useState("")

  // Données simulées pour l'historique des dons
  const donations: Donation[] = [
    {
      id: "DON-001",
      date: "2024-05-15",
      center: "Centre de don de sang, Hôpital Central",
      bloodType: "O+",
      volume: 450,
      status: "completed",
      certificate: "#",
    },
    {
      id: "DON-002",
      date: "2024-03-10",
      center: "Unité mobile de don, Place du Marché",
      bloodType: "O+",
      volume: 450,
      status: "completed",
      certificate: "#",
    },
    {
      id: "DON-003",
      date: "2024-01-05",
      center: "Centre de don de sang, Hôpital Central",
      bloodType: "O+",
      volume: 450,
      status: "completed",
      certificate: "#",
    },
    {
      id: "DON-004",
      date: "2023-11-20",
      center: "Centre de don de sang, Hôpital Central",
      bloodType: "O+",
      volume: 450,
      status: "completed",
      certificate: "#",
    },
    {
      id: "DON-005",
      date: "2023-09-15",
      center: "Unité mobile de don, Université",
      bloodType: "O+",
      volume: 450,
      status: "rejected",
      certificate: "#",
    },
    {
      id: "DON-006",
      date: "2023-07-10",
      center: "Centre de don de sang, Hôpital Central",
      bloodType: "O+",
      volume: 450,
      status: "completed",
      certificate: "#",
    },
    {
      id: "DON-007",
      date: "2023-05-05",
      center: "Centre de don de sang, Hôpital Central",
      bloodType: "O+",
      volume: 450,
      status: "completed",
      certificate: "#",
    },
    {
      id: "DON-008",
      date: "2023-03-01",
      center: "Unité mobile de don, Place du Marché",
      bloodType: "O+",
      volume: 450,
      status: "completed",
      certificate: "#",
    },
  ]

  // Filtrer les dons en fonction du terme de recherche
  const filteredDonations = donations.filter(
    (donation) =>
      donation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.center.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(donation.date).toLocaleDateString("fr-FR").includes(searchTerm),
  )

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusBadgeVariant = (status: Donation["status"]) => {
    switch (status) {
      case "completed":
        return "outline"
      case "processing":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Fonction pour obtenir le texte du statut en français
  const getStatusText = (status: Donation["status"]) => {
    switch (status) {
      case "completed":
        return "Complété"
      case "processing":
        return "En traitement"
      case "rejected":
        return "Rejeté"
      default:
        return status
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle>Historique des dons</CardTitle>
          <CardDescription>Consultez tous vos dons de sang précédents</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Rechercher par ID, centre ou date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                />
                <Eye className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-1 h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <Filter className="h-4 w-4" />
                    Filtrer
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-lg">
                  <DropdownMenuItem onClick={() => setSearchTerm("")} className="cursor-pointer">
                    Tous les dons
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("Complété")} className="cursor-pointer">
                    Dons complétés
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("Rejeté")} className="cursor-pointer">
                    Dons rejetés
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("2024")} className="cursor-pointer">
                    Dons 2024
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("2023")} className="cursor-pointer">
                    Dons 2023
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-medium">ID</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="hidden md:table-cell font-medium">Centre</TableHead>
                    <TableHead className="font-medium">Volume</TableHead>
                    <TableHead className="font-medium">Statut</TableHead>
                    <TableHead className="text-right font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Aucun résultat trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDonations.map((donation, index) => (
                      <TableRow key={donation.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-medium">{donation.id}</TableCell>
                        <TableCell>{new Date(donation.date).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate">{donation.center}</TableCell>
                        <TableCell>{donation.volume} ml</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(donation.status)}
                            className={
                              donation.status === "completed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : donation.status === "processing"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : ""
                            }
                          >
                            {getStatusText(donation.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={donation.status !== "completed"}
                            className="rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Télécharger le certificat</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
