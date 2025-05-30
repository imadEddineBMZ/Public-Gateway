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
import {getBloodTansfusionCentersDirectAuthenticated} from "@/services/api/bloodDonation/blood-transfusion-service"
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
  loggedUserSubscribed?: boolean  // Add this property
}

export default function HospitalsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [wilayaFilter, setWilayaFilter] = useState<string>("all")
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [wilayas, setWilayas] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subscribedCenters, setSubscribedCenters] = useState<{id: string, bloodTansfusionCenterId: string}[]>([])
  
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
        const centersData = await getBloodTansfusionCentersDirectAuthenticated(user?.token as string)
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
            openHours: "24h/24, 7j/7", 
            activeRequests: center.bloodDonationRequests?.filter((req: { evolutionStatus: number }) => req.evolutionStatus !== 3).length || 0,
            totalRequests: center.bloodDonationRequests?.length || 0,
            bloodBankCapacity: 500,
            specialties: ["Transfusion sanguine"],
            loggedUserSubscribed: center.loggedUserSubscribed || false  // Preserve this property
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

  // Determine hospital type based on name (still needed for badge display)
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

  // Filter hospitals (removed type filter)
  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearchTerm =
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesWilaya = wilayaFilter === "all" || hospital.wilaya === wilayaFilter

    return matchesSearchTerm && matchesWilaya
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredHospitals.length / hospitalsPerPage)
  const indexOfLastHospital = currentPage * hospitalsPerPage
  const indexOfFirstHospital = indexOfLastHospital - hospitalsPerPage
  const currentHospitals = filteredHospitals.slice(indexOfFirstHospital, indexOfLastHospital)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, wilayaFilter])

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  // Get badge color based on hospital type
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

  const handleSubscriptionToggle = async (hospitalId: string, currentSubscriptionId: string | null) => {
    if (!user) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour gérer vos abonnements.",
        variant: "destructive",
      });
      return;
    }
    
    // Use a scoped loading state instead of the global one
    const toggleButton = document.getElementById(`subscribe-btn-${hospitalId}`);
    if (toggleButton) {
      toggleButton.classList.add("loading"); 
    }
    
    try {
      if (currentSubscriptionId) {
        // Unsubscribe logic
        await unsubscribeFromBloodTansfusionCenter(user.token, currentSubscriptionId);
        
        // Update subscribedCenters state
        setSubscribedCenters(prev => prev.filter(sub => sub.id !== currentSubscriptionId));
        
        // IMPORTANT: Also update the hospital's loggedUserSubscribed property
        setHospitals(prev => 
          prev.map(h => 
            h.id === hospitalId 
              ? { ...h, loggedUserSubscribed: false } 
              : h
          )
        );
      } else {
        // Subscribe logic
        const result = await subscribeToBloodTansfusionCenter(user.token, hospitalId);
        
        // Update subscribedCenters state
        setSubscribedCenters(prev => [...prev, { 
          id: result || hospitalId, 
          bloodTansfusionCenterId: hospitalId 
        }]);
        
        // IMPORTANT: Also update the hospital's loggedUserSubscribed property
        setHospitals(prev => 
          prev.map(h => 
            h.id === hospitalId 
              ? { ...h, loggedUserSubscribed: true } 
              : h
          )
        );
      }
      
      // Show success toast
      toast({
        title: currentSubscriptionId ? "Désabonnement réussi" : "Abonnement réussi",
        description: currentSubscriptionId 
          ? "Vous ne recevrez plus de notifications de cet hôpital."
          : "Vous recevrez des notifications pour les demandes de sang de cet hôpital.",
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      });
    } catch (error) {
      console.error("Error toggling subscription:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'abonnement.",
        variant: "destructive",
      });
    } finally {
      // Remove loading state from button only
      if (toggleButton) {
        toggleButton.classList.remove("loading");
      }
    }
  };

  const isSubscribed = (hospital: any) => {
    // First check the loggedUserSubscribed property which comes directly from API
    if (hospital.loggedUserSubscribed === true) {
      return true;
    }
    
    // Fallback to local state if needed
    return subscribedCenters.some(sub => sub.bloodTansfusionCenterId === hospital.id);
  };

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
          <div className="text-center space-y-4 py-4 bg-gradient-to-r from-trust-blue/5 via-blue-50 to-trust-blue/5 rounded-2xl px-6">
            <h1 className="text-4xl font-bold text-trust-blue">Nos Hôpitaux Partenaires</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les établissements de santé qui font partie de notre réseau de don de sang à travers l'Algérie.
            </p>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent animate-pulse rounded-full" />
                <Loader2 className="h-16 w-16 text-hero-red animate-spin" />
              </div>
              <span className="mt-4 text-lg font-medium text-gray-700">Chargement des hôpitaux...</span>
              <p className="text-sm text-gray-500 mt-2">Veuillez patienter pendant que nous récupérons les informations</p>
            </div>
          ) : (
            <>
              {/* Filtres - Removed type filter and restyled to 2-column grid */}
              <Card className="border-t-4 border-t-trust-blue">
                <CardHeader className="pb-3 bg-gradient-to-r from-trust-blue/5 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Rechercher des hôpitaux
                  </CardTitle>
                  <CardDescription>Trouvez rapidement un établissement par nom ou wilaya</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="search" className="text-sm font-medium text-gray-700">
                        Recherche
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Nom, adresse ou spécialité..."
                          className="pl-9 border-gray-300 focus:border-trust-blue focus:ring-trust-blue/20"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="wilaya" className="text-sm font-medium text-gray-700">
                        Wilaya
                      </label>
                      <Select value={wilayaFilter} onValueChange={setWilayaFilter}>
                        <SelectTrigger id="wilaya" className="border-gray-300 focus:border-trust-blue focus:ring-trust-blue/20">
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
              {filteredHospitals.length > 0 && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    {currentHospitals.map((hospital, index) => (
                      <motion.div
                        key={hospital.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full border-t-4 border-t-trust-blue/70">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-trust-blue/20 to-trust-blue/5 rounded-lg flex items-center justify-center shadow-sm">
                                  <Building2 className="h-6 w-6 text-trust-blue" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg leading-tight">{hospital.name}</h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{hospital.wilaya}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge className={`${getTypeBadgeColor(hospital.type)} shadow-sm`}>
                                {hospital.type === "public" ? "Public" : 
                                 hospital.type === "private" ? "Privé" : "Centre"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-0">
                            <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{hospital.address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{hospital.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{hospital.openHours}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100">
                              <div className="text-center">
                                <div className="text-lg font-bold text-hero-red">{hospital.activeRequests}</div>
                                <div className="text-xs text-gray-500">Demandes actives</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-trust-blue">{hospital.totalRequests}</div>
                                <div className="text-xs text-gray-500">Total demandes</div>
                              </div>
                            </div>

                            <div>
                              <span className="text-sm font-medium text-gray-700 mb-2 block">Spécialités:</span>
                              <div className="flex flex-wrap gap-1">
                                {hospital.specialties.slice(0, 3).map((specialty, specialtyIndex) => (
                                  <Badge 
                                    key={specialtyIndex} 
                                    variant="outline" 
                                    className="text-xs bg-gray-50 border-gray-200"
                                  >
                                    {specialty}
                                  </Badge>
                                ))}
                                {hospital.specialties.length > 3 && (
                                  <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                                    +{hospital.specialties.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {user && (
                              <div className="pt-3 border-t border-gray-100">
                                <Button
                                  id={`subscribe-btn-${hospital.id}`}
                                  variant={isSubscribed(hospital) ? "outline" : "default"}
                                  onClick={() => {
                                    const subscription = subscribedCenters.find(
                                      sub => sub.bloodTansfusionCenterId === hospital.id
                                    );
                                    handleSubscriptionToggle(
                                      hospital.id, 
                                      isSubscribed(hospital) ? (subscription?.id || hospital.id) : null
                                    );
                                  }}
                                >
                                  {isSubscribed(hospital) ? "Se désabonner" : "S'abonner aux notifications"}
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

              {/* No results message */}
              {filteredHospitals.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border flex flex-col items-center">
                  <div className="rounded-full bg-gray-100 p-4 mb-3">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium">Aucun hôpital ne correspond à vos critères</p>
                  <p className="text-gray-500 mt-1">Veuillez essayer une autre recherche ou wilaya</p>
                </div>
              )}

              {/* Statistiques */}
              <Card className="border-t-4 border-t-trust-blue overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-trust-blue/5 to-transparent pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Statistiques des hôpitaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-trust-blue/10 rounded-lg border border-trust-blue/20 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-trust-blue">{hospitals.length}</div>
                      <div className="text-sm text-gray-600">Hôpitaux partenaires</div>
                    </div>
                    <div className="text-center p-4 bg-hero-red/10 rounded-lg border border-hero-red/20 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-hero-red">
                        {hospitals.reduce((sum, h) => sum + h.activeRequests, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Demandes actives</div>
                    </div>
                    <div className="text-center p-4 bg-life-green/10 rounded-lg border border-life-green/20 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-life-green">
                        {hospitals.reduce((sum, h) => sum + h.bloodBankCapacity, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Capacité totale</div>
                    </div>
                    <div className="text-center p-4 bg-hope-purple/10 rounded-lg border border-hope-purple/20 hover:shadow-md transition-shadow">
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
