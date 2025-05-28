"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Phone, Clock, Heart, Building2, Bell } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Import the useAuth hook at the top
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

// Types pour les hôpitaux
type Hospital = {
  id: string
  name: string
  type: "public" | "private" | "clinic"
  wilaya: string
  address: string
  phone: string
  email: string
  openHours: string
  activeRequests: number
  totalRequests: number
  bloodBankCapacity: number
  specialties: string[]
}

export default function HospitalsPage() {
  const { user, subscribeToHospital, unsubscribeFromHospital } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [wilayaFilter, setWilayaFilter] = useState<string>("all")

  // Données simulées pour les hôpitaux
  const hospitals: Hospital[] = [
    {
      id: "hospital-001",
      name: "Hôpital Central d'Alger",
      type: "public",
      wilaya: "Alger",
      address: "123 Avenue Principale, Alger Centre",
      phone: "021 23 45 67",
      email: "contact@hopital-central-alger.dz",
      openHours: "24h/24, 7j/7",
      activeRequests: 5,
      totalRequests: 45,
      bloodBankCapacity: 500,
      specialties: ["Cardiologie", "Neurologie", "Urgences", "Chirurgie"],
    },
    {
      id: "hospital-002",
      name: "Clinique El Azhar",
      type: "private",
      wilaya: "Alger",
      address: "456 Rue des Martyrs, Hydra",
      phone: "021 34 56 78",
      email: "info@clinique-elazhar.dz",
      openHours: "08:00 - 20:00",
      activeRequests: 2,
      totalRequests: 28,
      bloodBankCapacity: 200,
      specialties: ["Gynécologie", "Pédiatrie", "Médecine générale"],
    },
    {
      id: "hospital-003",
      name: "CHU Mustapha Pacha",
      type: "public",
      wilaya: "Alger",
      address: "789 Boulevard Mohamed V, Sidi M'Hamed",
      phone: "021 45 67 89",
      email: "contact@chu-mustapha.dz",
      openHours: "24h/24, 7j/7",
      activeRequests: 8,
      totalRequests: 120,
      bloodBankCapacity: 800,
      specialties: ["Oncologie", "Hématologie", "Transplantation", "Urgences"],
    },
    {
      id: "hospital-004",
      name: "Hôpital Universitaire d'Oran",
      type: "public",
      wilaya: "Oran",
      address: "321 Avenue de l'Indépendance, Oran",
      phone: "041 12 34 56",
      email: "contact@hu-oran.dz",
      openHours: "24h/24, 7j/7",
      activeRequests: 3,
      totalRequests: 67,
      bloodBankCapacity: 600,
      specialties: ["Cardiologie", "Pneumologie", "Néphrologie"],
    },
    {
      id: "hospital-005",
      name: "Centre Médical Privé Constantine",
      type: "clinic",
      wilaya: "Constantine",
      address: "654 Rue Larbi Ben M'hidi, Constantine",
      phone: "031 78 90 12",
      email: "info@cmp-constantine.dz",
      openHours: "07:00 - 22:00",
      activeRequests: 1,
      totalRequests: 15,
      bloodBankCapacity: 100,
      specialties: ["Chirurgie esthétique", "Dermatologie", "Ophtalmologie"],
    },
    {
      id: "hospital-006",
      name: "Hôpital Régional de Sétif",
      type: "public",
      wilaya: "Sétif",
      address: "987 Boulevard du 1er Novembre, Sétif",
      phone: "036 56 78 90",
      email: "contact@hr-setif.dz",
      openHours: "24h/24, 7j/7",
      activeRequests: 4,
      totalRequests: 52,
      bloodBankCapacity: 400,
      specialties: ["Médecine interne", "Chirurgie générale", "Maternité"],
    },
  ]

  const wilayas = ["Alger", "Oran", "Constantine", "Sétif", "Annaba", "Blida", "Batna", "Tlemcen"]
  const hospitalTypes = [
    { value: "public", label: "Hôpital public" },
    { value: "private", label: "Clinique privée" },
    { value: "clinic", label: "Centre médical" },
  ]

  // Filtrer les hôpitaux
  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearchTerm =
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === "all" || hospital.type === typeFilter
    const matchesWilaya = wilayaFilter === "all" || hospital.wilaya === wilayaFilter

    return matchesSearchTerm && matchesType && matchesWilaya
  })

  const getTypeLabel = (type: string) => {
    const typeObj = hospitalTypes.find((t) => t.value === type)
    return typeObj ? typeObj.label : type
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "public":
        return "bg-trust-blue text-white"
      case "private":
        return "bg-hero-red text-white"
      case "clinic":
        return "bg-hope-purple text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleSubscription = (hospitalId: string, isSubscribed: boolean) => {
    if (!user) {
      // Redirect to login or show message
      return
    }

    if (isSubscribed) {
      unsubscribeFromHospital(hospitalId)
      toast({
        title: "Désabonnement réussi",
        description: "Vous ne recevrez plus de notifications de cet hôpital.",
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      })
    } else {
      subscribeToHospital(hospitalId)
      toast({
        title: "Abonnement réussi",
        description: "Vous recevrez des notifications pour les demandes de sang de cet hôpital.",
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      })
    }
  }

  const isSubscribed = (hospitalId: string) => {
    return user?.notificationPreferences?.subscribedHospitals.includes(hospitalId) || false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      {/* Header */}
    

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-trust-blue">Nos Hôpitaux Partenaires</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les établissements de santé qui font partie de notre réseau de don de sang à travers l'Algérie.
            </p>
          </div>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Rechercher des hôpitaux</CardTitle>
              <CardDescription>Filtrez les hôpitaux par nom, type ou wilaya</CardDescription>
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
                      placeholder="Nom, adresse ou spécialité..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Type d'établissement
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {hospitalTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="wilaya" className="text-sm font-medium">
                    Wilaya
                  </label>
                  <Select value={wilayaFilter} onValueChange={setWilayaFilter}>
                    <SelectTrigger id="wilaya">
                      <SelectValue placeholder="Toutes les wilayas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les wilayas</SelectItem>
                      {wilayas.map((wilaya) => (
                        <SelectItem key={wilaya} value={wilaya}>
                          {wilaya}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des hôpitaux */}
          {filteredHospitals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">Aucun hôpital ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredHospitals.map((hospital, index) => (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-trust-blue" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{hospital.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{hospital.wilaya}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getTypeBadgeColor(hospital.type)}>{getTypeLabel(hospital.type)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{hospital.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{hospital.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{hospital.openHours}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-lg font-bold text-hero-red">{hospital.activeRequests}</div>
                          <div className="text-xs text-gray-500">Demandes actives</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-trust-blue">{hospital.totalRequests}</div>
                          <div className="text-xs text-gray-500">Total demandes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-life-green">{hospital.bloodBankCapacity}</div>
                          <div className="text-xs text-gray-500">Capacité banque</div>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Spécialités:</span>
                        <div className="flex flex-wrap gap-1">
                          {hospital.specialties.slice(0, 3).map((specialty, specialtyIndex) => (
                            <Badge key={specialtyIndex} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {hospital.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hospital.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {user && (
                        <div className="pt-3 border-t border-gray-100">
                          <Button
                            variant={isSubscribed(hospital.id) ? "outline" : "default"}
                            size="sm"
                            className={cn(
                              "w-full",
                              isSubscribed(hospital.id)
                                ? "border-hero-red text-hero-red hover:bg-red-50"
                                : "bg-hero-red hover:bg-hero-red/90 text-white",
                            )}
                            onClick={() => handleSubscription(hospital.id, isSubscribed(hospital.id))}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            {isSubscribed(hospital.id) ? "Se désabonner" : "S'abonner aux notifications"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques des hôpitaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-trust-blue/10 rounded-lg">
                  <div className="text-2xl font-bold text-trust-blue">{hospitals.length}</div>
                  <div className="text-sm text-gray-600">Hôpitaux partenaires</div>
                </div>
                <div className="text-center p-4 bg-hero-red/10 rounded-lg">
                  <div className="text-2xl font-bold text-hero-red">
                    {hospitals.reduce((sum, h) => sum + h.activeRequests, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Demandes actives</div>
                </div>
                <div className="text-center p-4 bg-life-green/10 rounded-lg">
                  <div className="text-2xl font-bold text-life-green">
                    {hospitals.reduce((sum, h) => sum + h.bloodBankCapacity, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Capacité totale</div>
                </div>
                <div className="text-center p-4 bg-hope-purple/10 rounded-lg">
                  <div className="text-2xl font-bold text-hope-purple">
                    {new Set(hospitals.map((h) => h.wilaya)).size}
                  </div>
                  <div className="text-sm text-gray-600">Wilayas couvertes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
