"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Phone, Clock, Heart, Building2, Bell, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  getBloodTansfusionCenters, 
  getWilayas,
  subscribeToBloodTansfusionCenter,
  unsubscribeFromBloodTansfusionCenter
} from "@/services/api-service"
import { BloodTansfusionCenterDTO } from "@/client/models"

// Import the useAuth hook at the top
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"

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
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [wilayaFilter, setWilayaFilter] = useState<string>("all")
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [wilayas, setWilayas] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subscribedCenters, setSubscribedCenters] = useState<string[]>([])
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const hospitalsPerPage = 6

  // Fetch data from API when component mounts
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        console.log("Fetching blood transfusion centers...")
        // Fetch blood transfusion centers
        const centersData = await getBloodTansfusionCenters()
        console.log("API response:", centersData)

        if (centersData && Array.isArray(centersData)) {
          // Map API data to our Hospital format
          const mappedHospitals: Hospital[] = centersData.map((center) => ({
            id: center.id || "",
            name: center.name || "",
            type: determineHospitalType(center.name || ""),
            wilaya: center.wilaya?.name || "",
            address: center.address || "",
            phone: center.tel || "",
            email: center.email || "",
            openHours: "24h/24, 7j/7", // Default value
            activeRequests: center.bloodDonationRequests?.filter(req => req.evolutionStatus !== 3).length || 0,
            totalRequests: center.bloodDonationRequests?.length || 0,
            bloodBankCapacity: 500, // Default value
            specialties: ["Transfusion sanguine"], // Default value
          }))
          
          setHospitals(mappedHospitals)
        } else {
          console.error("Unexpected data format:", centersData)
          toast({
            title: "Erreur de format",
            description: "Les données reçues ne sont pas dans le format attendu.",
            variant: "destructive",
          })
        }

        // Fetch wilayas for filtering
        const wilayasData = await getWilayas()
        if (wilayasData && Array.isArray(wilayasData)) {
          const wilayaNames = wilayasData.map(w => w.name || "").filter(Boolean)
          setWilayas(wilayaNames)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Erreur de connexion",
          description: "Impossible de charger les données. Veuillez réessayer plus tard.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [toast])

  // Determine hospital type based on name
  function determineHospitalType(name: string): "public" | "private" | "clinic" {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("chu") || lowerName.includes("public")) {
      return "public"
    } else if (lowerName.includes("clinique") || lowerName.includes("privé")) {
      return "private"
    } else {
      return "clinic"
    }
  }

  const hospitalTypes = [
    { value: "public", label: "Hôpital public" },
    { value: "private", label: "Clinique privée" },
    { value: "clinic", label: "Centre médical" },
  ]

  // Filter hospitals
  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearchTerm =
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === "all" || hospital.type === typeFilter
    const matchesWilaya = wilayaFilter === "all" || hospital.wilaya === wilayaFilter

    return matchesSearchTerm && matchesType && matchesWilaya
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredHospitals.length / hospitalsPerPage)
  const indexOfLastHospital = currentPage * hospitalsPerPage
  const indexOfFirstHospital = indexOfLastHospital - hospitalsPerPage
  const currentHospitals = filteredHospitals.slice(indexOfFirstHospital, indexOfLastHospital)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, wilayaFilter])

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

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

  const handleSubscription = async (hospitalId: string, isSubscribed: boolean) => {
    if (!user?.token) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour vous abonner aux notifications.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      if (isSubscribed) {
        // Unsubscribe using API
        await unsubscribeFromBloodTansfusionCenter(user.token, hospitalId)
        setSubscribedCenters(prev => prev.filter(id => id !== hospitalId))
        toast({
          title: "Désabonnement réussi",
          description: "Vous ne recevrez plus de notifications de cet hôpital.",
          className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
        })
      } else {
        // Subscribe using API
        const response = await subscribeToBloodTansfusionCenter(user.token, hospitalId)
        setSubscribedCenters(prev => [...prev, hospitalId])
        toast({
          title: "Abonnement réussi",
          description: "Vous recevrez des notifications pour les demandes de sang de cet hôpital.",
          className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
        })
      }
    } catch (error) {
      console.error("Error with subscription:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'abonnement.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isSubscribed = (hospitalId: string) => {
    return user?.notificationPreferences?.subscribedHospitals.includes(hospitalId) || 
           subscribedCenters.includes(hospitalId) || 
           false
  }

  // Render pagination controls
  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={prevPage} 
              className={cn(currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer")}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            
            // Show first page, last page, current page, and pages around current page
            if (
              pageNumber === 1 || 
              pageNumber === totalPages || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink 
                    isActive={pageNumber === currentPage}
                    onClick={() => paginate(pageNumber)}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            }
            
            // Show ellipsis for gaps
            if (pageNumber === 2 && currentPage > 3) {
              return (
                <PaginationItem key="ellipsis-start">
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }
            
            if (pageNumber === totalPages - 1 && currentPage < totalPages - 2) {
              return (
                <PaginationItem key="ellipsis-end">
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }
            
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={nextPage} 
              className={cn(currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
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

          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 text-hero-red animate-spin" />
              <span className="ml-2 text-lg">Chargement des hôpitaux...</span>
            </div>
          ) : (
            <>
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
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    {currentHospitals.map((hospital, index) => (
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
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Bell className="h-4 w-4 mr-2" />
                                  )}
                                  {isSubscribed(hospital.id) ? "Se désabonner" : "S'abonner aux notifications"}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {renderPaginationControls()}
                  
                  {/* Results counter */}
                  <div className="text-center text-sm text-gray-500 mt-4">
                    Affichage de {indexOfFirstHospital + 1} à {Math.min(indexOfLastHospital, filteredHospitals.length)} sur {filteredHospitals.length} hôpitaux
                  </div>
                </>
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
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
