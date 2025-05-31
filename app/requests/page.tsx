"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock,Droplet, AlertTriangle, Heart, Building2, UserPlus, HandHeart, ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  getPublicBloodDonationRequests, 
  getAuthenticatedBloodDonationRequests,
  getWilayas,
  pledgeToDonate,
  createPledge
} from "@/services/api-service"
import { WILAYA_MAP } from "@/services/api/locations/locations-service"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"
import { Textarea } from "@/components/ui/textarea"
import { AuthRequiredDialog } from "@/components/auth-required-dialog"

// Types pour les demandes de sang
type RequestUrgency = "critical" | "urgent" | "standard"
type BloodRequest = {
  id: string
  hospitalName: string
  hospitalType: "public" | "private" | "clinic"
  bloodType: string
  bloodGroup?: number
  urgency: RequestUrgency
  deadline: string
  location: string
  wilayaId?: number // Add this to store the original wilaya ID
  distance: number
  notes: string
  unitsNeeded: number
  contactInfo: {
    phone: string
    email: string
    contactPerson: string
  }
}

// Blood Group Mapping
const BLOOD_GROUP_MAP = {
  1: "AB+",
  2: "AB-",
  3: "A+",
  4: "A-",
  5: "B+",
  6: "B-",
  7: "O+",
  8: "O-"
};

// Compatibility mapping for blood types (simplified)
const BLOOD_TYPE_COMPATIBILITY = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],
  "AB-": ["AB-", "A-", "B-", "O-"],
  "O+": ["O+"],
  "O-": ["O-"],
};

export default function RequestsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all")
  const [wilayaFilter, setWilayaFilter] = useState<string>("all")
  const [compatibilityFilter, setCompatibilityFilter] = useState(false)
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [wilayas, setWilayas] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPledging, setIsPledging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [requestsPerPage] = useState(6) // Number of requests per page
  const [pledgeNotes, setPledgeNotes] = useState("") // State for pledge notes
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  // Utility function for debugging API responses
  const debugLog = (message: string, data: any) => {
    console.log(`[DEBUG] ${message}:`, data);
    // For development, we can display in the console what we're receiving
    if (typeof data === 'object') {
      console.log('Keys:', Object.keys(data || {}));
    }
  };

  // Retry mechanism for failed data fetching
  const fetchWithRetry = async (fetchFn: () => Promise<any>, retries = 2) => {
    try {
      return await fetchFn();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying fetch... (${retries} attempts left)`);
        return fetchWithRetry(fetchFn, retries - 1);
      }
      throw error;
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Add fetch level parameter to get the blood transfusion center data
        const fetchLevel = 2;
        
        // Fetch blood donation requests based on authentication status with fetchLevel
        debugLog("Fetching requests with auth status", !!user?.token);
        
        const requestsData = await fetchWithRetry(async () => {
          return user?.token
            ? await getAuthenticatedBloodDonationRequests(user.token, fetchLevel)
            : await getPublicBloodDonationRequests(fetchLevel);
        });
        
        debugLog("API blood requests response", requestsData);
        
        // Map API data to our BloodRequest format
        if (requestsData && Array.isArray(requestsData)) {
          const mappedRequests: BloodRequest[] = requestsData.map(req => {
            // Log each request to inspect the structure
            debugLog("Processing request", req);
            debugLog("BTC data", req.bloodTansfusionCenter);
            
            return {
              id: req.id || "",
              hospitalName: req.bloodTansfusionCenter?.name || 
                            req.btc?.name || 
                            req.bloodTransfusionCenter?.name || 
                            req.hospitalName ||
                            "Hôpital inconnu",
              hospitalType: determineHospitalType(
                req.bloodTansfusionCenter?.name || 
                req.btc?.name || 
                req.bloodTransfusionCenter?.name || 
                req.hospitalName || 
                ""
              ),
              // Convert numeric blood group to text representation
              bloodType: req.bloodGroup ? BLOOD_GROUP_MAP[req.bloodGroup as keyof typeof BLOOD_GROUP_MAP] || "?" : req.bloodType || req.donorBloodGroup || "?",
              bloodGroup: req.bloodGroup, // Store the original numeric value
              urgency: determineUrgency(req.evolutionStatus, req.requestDueDate || req.deadline),
              deadline: req.requestDueDate || req.deadline || new Date().toISOString().split('T')[0],
              // Use wilaya ID mapping when available
              location: getWilayaName(
                req.bloodTansfusionCenter?.wilaya?.id,
                req.bloodTansfusionCenter?.wilaya?.name || 
                req.btc?.wilaya?.name || 
                req.bloodTransfusionCenter?.wilaya?.name || 
                req.location
              ),
              wilayaId: req.bloodTansfusionCenter?.wilaya?.id || req.btc?.wilaya?.id || req.bloodTransfusionCenter?.wilaya?.id, // Store the original ID
              distance: 5, // Default distance
              notes: req.moreDetails || req.description || req.notes || "",
              unitsNeeded: req.requestedQty || req.unitsNeeded || 1,
              contactInfo: {
                phone: req.bloodTansfusionCenter?.tel || 
                       req.btc?.tel || 
                       req.bloodTransfusionCenter?.tel || 
                       req.contactInfo?.phone || 
                       "",
                email: req.bloodTansfusionCenter?.email || 
                       req.btc?.email || 
                       req.bloodTransfusionCenter?.email || 
                       req.contactInfo?.email || 
                       "",
                contactPerson: req.contactPerson || 
                              req.contactInfo?.contactPerson || 
                              "Contact non spécifié",
              },
            };
          });
          
          debugLog("Mapped requests", mappedRequests);
          setRequests(mappedRequests);
        } else {
          console.error("Unexpected data format:", requestsData);
          setError("Les données reçues ne sont pas dans le format attendu.");
          toast({
            title: "Erreur de format",
            description: "Les données reçues ne sont pas dans le format attendu.",
            variant: "destructive",
          });
        }
        
        // Fetch wilayas for filtering
        const wilayasData = await getWilayas();
        debugLog("Wilayas data", wilayasData);
        
        if (wilayasData && Array.isArray(wilayasData)) {
          // Try to get names from API data first
          let wilayaNames = wilayasData.map(w => w.name || "").filter(Boolean);
          
          // If API didn't return enough names, use our mapping
          if (wilayaNames.length < 10) { // threshold to detect if API data is incomplete
            wilayaNames = Object.values(WILAYA_MAP).sort();
          }
          
          setWilayas(wilayaNames);
        } else {
          // Fallback to our mapping if API fails
          setWilayas(Object.values(WILAYA_MAP).sort());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Impossible de charger les demandes de sang. Veuillez réessayer.");
        toast({
          title: "Erreur de connexion",
          description: "Impossible de charger les demandes de sang. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
        
        // If API fails, add some fallback data to still show the UI
        setRequests([
          {
            id: "fallback-1",
            hospitalName: "Hôpital Central",
            hospitalType: "public",
            bloodType: "O+",
            urgency: "critical",
            deadline: new Date().toISOString().split('T')[0],
            location: "Alger",
            distance: 2.5,
            notes: "Données temporaires - Problème de connexion à l'API",
            unitsNeeded: 3,
            contactInfo: {
              phone: "0123456789",
              email: "contact@hopital.dz",
              contactPerson: "Service de transfusion",
            },
          },
          {
            id: "fallback-2",
            hospitalName: "Clinique El Azhar",
            hospitalType: "private",
            bloodType: "A+",
            urgency: "standard",
            deadline: new Date().toISOString().split('T')[0],
            location: "Oran",
            distance: 4.8,
            notes: "Données temporaires - Problème de connexion à l'API",
            unitsNeeded: 2,
            contactInfo: {
              phone: "0123456789",
              email: "contact@clinique.dz",
              contactPerson: "Service de transfusion",
            },
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [toast, user]);
  

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
  
  // Determine urgency based on evolution status and deadline
  function determineUrgency(evolutionStatus?: number, deadline?: string): RequestUrgency {
    if (evolutionStatus === 1) return "critical"
    
    if (deadline) {
      const deadlineDate = new Date(deadline)
      const today = new Date()
      const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 2) return "critical"
      if (diffDays <= 7) return "urgent"
    }
    
    return "standard"
  }

  // Handle pledge to donate
  const handlePledge = async (requestId: string) => {
    if (!user?.token) {
      // Show the auth required dialog instead of just a toast
      setShowAuthDialog(true);
      return;
    }

    try {
      setIsPledging(true)
      
      // Create pledge data object with all required fields
      const pledgeData = {
        bloodDonationRequestId: requestId,
        pledgeDate: new Date().toISOString(),
        pledgeNotes: pledgeNotes || "Engagement depuis la page des demandes"
      }
      
      const response = await createPledge(user.token, pledgeData)
      
      console.log("Pledge created successfully:", response)
      
      toast({
        title: "Engagement réussi",
        description: "Merci pour votre engagement! L'hôpital a été notifié.",
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      })
      
      router.push(`/dashboard/pledges?new=true`)
    } catch (error: any) {
      console.error("Error pledging to donate:", error)
      
      // Enhanced error handling based on API error format
      let errorMessage = "Une erreur est survenue lors de l'engagement. Veuillez réessayer."
      
      if (error?.errors && Array.isArray(error.errors)) {
        // Extract specific error messages from the error response
        errorMessage = error.errors.map((err: any) => 
          `${err.name || 'Erreur'}: ${err.reason || 'Inconnue'}`
        ).join(", ")
      } else if (error?.detail) {
        errorMessage = error.detail
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsPledging(false)
    }
  }

  // Retry loading data
  const handleRetry = () => {
    setRequests([]);
    setWilayas([]);
    setIsLoading(true);
    setError(null);
    
    // Re-trigger the useEffect
    const timer = setTimeout(() => {
      // This will cause the useEffect to run again
      router.refresh();
    }, 100);
    
    return () => clearTimeout(timer);
  };

  // Filtrer les demandes
  const filteredRequests = requests.filter((request) => {
    // Basic search term matching
    const matchesSearchTerm =
      request.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.notes.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by urgency
    const matchesUrgency = urgencyFilter === "all" || request.urgency === urgencyFilter
    
    // Filter by blood type
    const matchesBloodType = bloodTypeFilter === "all" || request.bloodType === bloodTypeFilter
    
    // Filter by wilaya
    const matchesWilaya = wilayaFilter === "all" || 
                     request.location === wilayaFilter || 
                     (request.wilayaId && WILAYA_MAP[request.wilayaId as keyof typeof WILAYA_MAP] === wilayaFilter);
    
    // Filter by compatibility (only if user is logged in and has a blood type)
    let matchesCompatibility = true;
    if (user && user.bloodType && compatibilityFilter) {
      const compatibleTypes = BLOOD_TYPE_COMPATIBILITY[user.bloodType as keyof typeof BLOOD_TYPE_COMPATIBILITY] || [];
      matchesCompatibility = compatibleTypes.includes(request.bloodType);
    }

    return matchesSearchTerm && matchesUrgency && matchesBloodType && matchesWilaya && matchesCompatibility;
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage)
  const indexOfLastRequest = currentPage * requestsPerPage
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest)
  
  // Pagination control functions
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, urgencyFilter, bloodTypeFilter, wilayaFilter, compatibilityFilter])
  
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

  const getHospitalTypeLabel = (type: string) => {
    switch (type) {
      case "public":
        return "Hôpital public"
      case "private":
        return "Clinique privée"
      case "clinic":
        return "Centre médical"
      default:
        return type
    }
  }

  const getProgress = (collected: number, needed: number) => {
    return (collected / needed) * 100
  }

  // Helper function to get wilaya name from ID or fallback to provided name
  function getWilayaName(wilayaId?: number | null, fallbackName?: string): string {
    if (wilayaId && WILAYA_MAP[wilayaId as keyof typeof WILAYA_MAP]) {
      return WILAYA_MAP[wilayaId as keyof typeof WILAYA_MAP];
    }
    return fallbackName || "Inconnu";
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
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-trust-blue">Demandes de Sang</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Consultez les demandes de sang actuelles des hôpitaux et aidez à sauver des vies en donnant votre sang.
            </p>
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 text-blue-800">
                  <UserPlus className="h-5 w-5" />
                  <span className="font-medium">Créez un compte pour plus de fonctionnalités</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Vous pouvez voir toutes les demandes, mais vous devez créer un compte pour vous engager à donner du
                  sang et vous abonner aux notifications.{" "}
                  <Link href="/register" className="underline hover:text-blue-900 font-medium">
                    S'inscrire maintenant
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Rechercher des demandes</CardTitle>
              <CardDescription>Filtrez les demandes par urgence, groupe sanguin ou localisation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <label htmlFor="search" className="text-sm font-medium">
                    Recherche
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Hôpital, lieu ou détails..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="urgency" className="text-sm font-medium">
                    Priorité
                  </label>
                  <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                    <SelectTrigger id="urgency">
                      <SelectValue placeholder="Toutes les priorités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
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
                      {bloodTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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
                      {wilayas.sort().map((wilaya) => (
                        <SelectItem key={wilaya} value={wilaya}>
                          {wilaya}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Compatibility filter - Only shown for logged in users */}
                {user && user.bloodType && (
                  <div className="md:col-span-4">
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox 
                        id="compatibility" 
                        checked={compatibilityFilter}
                        onCheckedChange={(checked) => setCompatibilityFilter(checked as boolean)}
                      />
                      <label
                        htmlFor="compatibility"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Afficher uniquement les demandes compatibles avec mon groupe sanguin ({user.bloodType})
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader2 className="h-12 w-12 text-hero-red animate-spin mb-4" />
              <span className="text-lg">Chargement des demandes de sang...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center py-12 bg-white rounded-lg border">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-gray-700 text-lg font-medium mb-2">Problème de chargement</p>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button 
                onClick={handleRetry} 
                className="flex items-center gap-2 bg-hero-red hover:bg-hero-red/90 text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            </div>
          ) : (
            <>
              {/* Liste des demandes */}
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <p className="text-gray-500">Aucune demande ne correspond à vos critères de recherche.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {currentRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        className={cn(
                          "hover:shadow-lg transition-shadow duration-300 h-full",
                          request.urgency === "critical"
                            ? "border-l-4 border-l-alert-coral"
                            : request.urgency === "urgent"
                              ? "border-l-4 border-l-hero-red"
                              : "",
                        )}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-hero-red/10 rounded-lg flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-hero-red" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{request.hospitalName}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>
                                    {request.location} ({request.distance} km)
                                  </span>
                                </div>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {getHospitalTypeLabel(request.hospitalType)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant={getUrgencyBadgeVariant(request.urgency)}
                                className={cn(
                                  request.urgency === "critical"
                                    ? "bg-alert-coral text-white border-alert-coral animate-pulse"
                                    : request.urgency === "urgent"
                                      ? "bg-hero-red text-white border-hero-red"
                                      : "",
                                )}
                              >
                                {request.urgency === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {getUrgencyText(request.urgency)}
                              </Badge>
                              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-hero-red font-bold text-lg">
                                {request.bloodType}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-sm text-gray-500 flex items-center">
                            <Droplet className="h-3.5 w-3.5 mr-1 text-red-600" />
                            <span className="font-semibold">BloodBagType: Plasma</span>
                          </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="font-semibold">Date limite: {new Date(request.deadline).toLocaleDateString("fr-FR")}</span>
                          </div>

                          <p className="text-sm text-gray-600">{request.notes}</p>

                          <div className="border-t pt-3 space-y-1 text-xs text-gray-500">
                            <div>Contact: {request.contactInfo.contactPerson}</div>
                            <div>Tél: {request.contactInfo.phone}</div>
                            <div>Email: {request.contactInfo.email}</div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            {user ? (
                              <div className="flex gap-2 w-full">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      className="flex-1 bg-hero-red hover:bg-hero-red/90 text-white gap-1"
                                      disabled={isPledging}
                                    >
                                      {isPledging ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Traitement...
                                        </>
                                      ) : (
                                        <>
                                          <HandHeart className="h-4 w-4" />
                                          S'engager à donner
                                        </>
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>S'engager à donner du sang</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Vous êtes sur le point de vous engager à donner du sang pour cette demande.
                                        L'hôpital sera notifié et vous recevrez les détails pour votre rendez-vous.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-4">
                                      <label htmlFor="pledgeNotes" className="text-sm font-medium">
                                        Notes (optionnel)
                                      </label>
                                      <Textarea 
                                        id="pledgeNotes" 
                                        placeholder="Ajoutez des informations supplémentaires si nécessaire"
                                        className="mt-1"
                                        value={pledgeNotes}
                                        onChange={(e) => setPledgeNotes(e.target.value)}
                                      />
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handlePledge(request.id)}
                                        className="bg-hero-red hover:bg-hero-red/90"
                                      >
                                        Confirmer l'engagement
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <Link href="/dashboard/requests">
                                  <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:text-trust-blue">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            ) : (
                              <Link href="/register" className="flex-1">
                                <Button className="w-full bg-hero-red hover:bg-hero-red/90 text-white gap-1">
                                  <UserPlus className="h-4 w-4" />
                                  S'inscrire pour aider
                                </Button>
                              </Link>
                            )}
                            <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:text-trust-blue">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Add pagination controls */}
              {renderPaginationControls()}
              
              {/* Results counter */}
              {filteredRequests.length > 0 && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  Affichage de {indexOfFirstRequest + 1} à {Math.min(indexOfLastRequest, filteredRequests.length)} sur {filteredRequests.length} demandes
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
