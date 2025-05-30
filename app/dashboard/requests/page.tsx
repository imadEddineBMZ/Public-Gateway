"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { BloodRequestCard, BloodRequest as CardBloodRequest } from "@/components/blood-request-card"

// Types pour les demandes de sang
type RequestUrgency = "critical" | "urgent" | "standard"
type BloodRequest = {
  id: string
  hospitalName: string
  bloodType: string
  bloodGroup: string
  urgency: RequestUrgency
  priority: RequestUrgency
  deadline: string
  location: string
  distance: number
  notes: string
  donationType: string
  unitsNeeded: number
}

export default function RequestsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all")
  // Données simulées pour les demandes de sang
  const [requests, setRequests] = useState<BloodRequest[]>([
    {
      id: "req-001",
      hospitalName: "Hôpital Central",
      bloodType: "O+",
      bloodGroup: "O+",
      urgency: "critical",
      priority: "critical",
      deadline: "2024-05-25",
      location: "Alger",
      distance: 2.5,
      notes: "",
      donationType: "",
      unitsNeeded: 2
    },
    {
      id: "req-002",
      hospitalName: "Clinique El Azhar",
      bloodType: "A+",
      bloodGroup: "A+",
      urgency: "urgent",
      priority: "urgent",
      deadline: "2024-05-30",
      location: "Alger",
      distance: 4.8,
      notes: "",
      donationType: "",
      unitsNeeded: 1
    },
    {
      id: "req-003",
      hospitalName: "Hôpital Universitaire",
      bloodType: "B-",
      bloodGroup: "B-",
      urgency: "standard",
      priority: "standard",
      deadline: "2024-06-10",
      location: "Alger",
      distance: 7.2,
      notes: "",
      donationType: "",
      unitsNeeded: 2
    },
    {
      id: "req-004",
      hospitalName: "Centre Médical Ain Naadja",
      bloodType: "AB+",
      bloodGroup: "AB+",
      urgency: "urgent",
      priority: "urgent",
      deadline: "2024-05-28",
      location: "Alger",
      distance: 5.1,
      notes: "Besoin pour un patient en soins intensifs suite à un accident de la route.",
      donationType: "",
      unitsNeeded: 1
    },
    {
      id: "req-005",
      hospitalName: "Hôpital Mustapha Pacha",
      bloodType: "O-",
      bloodGroup: "O-",
      urgency: "critical",
      priority: "critical",
      deadline: "2024-05-24",
      location: "Alger",
      distance: 3.7,
      notes: "Urgence pour une femme enceinte présentant des complications.",
      donationType: "",
      unitsNeeded: 3
    },
    {
      id: "req-006",
      hospitalName: "Clinique Privée Hydra",
      bloodType: "A-",
      bloodGroup: "A-",
      urgency: "standard",
      priority: "standard",
      deadline: "2024-06-05",
      location: "Alger",
      distance: 8.3,
      notes: "Besoin régulier pour le service d'oncologie.",
      donationType: "Red Cells",
      unitsNeeded: 3
    }
  ])

  // Filtrer les demandes en fonction des critères
  const filteredRequests = requests.filter((request) => {
    // Filtre par terme de recherche
    const matchesSearchTerm =
      request.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtre par urgence
    const matchesUrgency = urgencyFilter === "all" || request.urgency === urgencyFilter

    // Filtre par type de sang
    const matchesBloodType = bloodTypeFilter === "all" || request.bloodType === bloodTypeFilter

    return matchesSearchTerm && matchesUrgency && matchesBloodType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-trust-blue">Demandes de sang</h1>
          <p className="text-gray-500">Trouvez des demandes de sang compatibles dans votre région</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Affinez votre recherche de demandes de sang</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Hôpital, lieu..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="urgency" className="text-sm font-medium">
                Urgence
              </label>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger id="urgency">
                  <SelectValue placeholder="Toutes les urgences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les urgences</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="bloodType" className="text-sm font-medium">
                Groupe sanguin
              </label>
              <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Tous les groupes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les groupes</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">Aucune demande ne correspond à vos critères de recherche.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <BloodRequestCard 
              key={request.id} 
              request={request as unknown as CardBloodRequest} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
