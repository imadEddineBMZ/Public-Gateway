"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock, AlertTriangle, Heart, Building2, UserPlus, HandHeart, ExternalLink, Loader2 } from "lucide-react"
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
  pledgeToDonate 
} from "@/services/api-service"

// Types pour les demandes de sang
type RequestUrgency = "critical" | "urgent" | "standard"
type BloodRequest = {
  id: string
  hospitalName: string
  hospitalType: "public" | "private" | "clinic"
  bloodType: string
  urgency: RequestUrgency
  deadline: string
  location: string
  distance: number
  notes: string
  unitsNeeded: number
  unitsCollected: number
  contactInfo: {
    phone: string
    email: string
    contactPerson: string
  }
}

export default function RequestsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all")
  const [wilayaFilter, setWilayaFilter] = useState<string>("all")
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [wilayas, setWilayas] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPledging, setIsPledging] = useState(false)

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Add fetch level parameter to get the blood transfusion center data
        const fetchLevel = 2; // Level 1 includes blood transfusion centers
        
        // Fetch blood donation requests based on authentication status with fetchLevel
        const requestsData = user?.token
          ? await getAuthenticatedBloodDonationRequests(user.token, fetchLevel)
          : await getPublicBloodDonationRequests(fetchLevel)
        
        console.log("API blood requests response:", requestsData);
        
        // Map API data to our BloodRequest format
        if (requestsData && Array.isArray(requestsData)) {
          const mappedRequests: BloodRequest[] = requestsData.map(req => {
            // Log each request to inspect the structure
            console.log("Processing request:", req);
            console.log("BTC data:", req.bloodTansfusionCenter);
            
            return {
              id: req.id || "",
              // Try different ways to access the hospital name
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
              bloodType: req.bloodType || "?",
              urgency: determineUrgency(req.evolutionStatus, req.deadline),
              deadline: req.deadline || new Date().toISOString().split('T')[0],
              location: req.bloodTansfusionCenter?.wilaya?.name || 
                        req.btc?.wilaya?.name || 
                        req.bloodTransfusionCenter?.wilaya?.name || 
                        req.location || 
                        "Inconnu",
              distance: 5, // Default distance
              notes: req.description || req.notes || "",
              unitsNeeded: req.unitsNeeded || 1,
              unitsCollected: req.unitsCollected || 0,
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
          
          setRequests(mappedRequests);
        } else {
          console.error("Unexpected data format:", requestsData)
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
          description: "Impossible de charger les demandes de sang. Veuillez réessayer plus tard.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [toast, user])
  
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
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour vous engager à donner du sang.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsPledging(true)
      await pledgeToDonate(user.token, requestId)
      
      toast({
        title: "Engagement réussi",
        description: "Merci pour votre engagement! L'hôpital a été notifié.",
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      })
      
      router.push(`/dashboard/pledges?new=true`)
    } catch (error) {
      console.error("Error pledging to donate:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'engagement. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsPledging(false)
    }
  }

  // Filtrer les demandes
  const filteredRequests = requests.filter((request) => {
    const matchesSearchTerm =
      request.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.notes.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUrgency = urgencyFilter === "all" || request.urgency === urgencyFilter
    const matchesBloodType = bloodTypeFilter === "all" || request.bloodType === bloodTypeFilter
    const matchesWilaya = wilayaFilter === "all" || request.location === wilayaFilter

    return matchesSearchTerm && matchesUrgency && matchesBloodType && matchesWilaya
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

          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 text-hero-red animate-spin" />
              <span className="ml-2 text-lg">Chargement des demandes de sang...</span>
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
                  {filteredRequests.map((request, index) => (
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
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Date limite: {new Date(request.deadline).toLocaleDateString("fr-FR")}</span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progression</span>
                              <span>
                                {request.unitsCollected}/{request.unitsNeeded} unités
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-life-green h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgress(request.unitsCollected, request.unitsNeeded)}%` }}
                              ></div>
                            </div>
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

              {/* Statistiques */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques des demandes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-hero-red/10 rounded-lg">
                      <div className="text-2xl font-bold text-hero-red">{requests.length}</div>
                      <div className="text-sm text-gray-600">Demandes totales</div>
                    </div>
                    <div className="text-center p-4 bg-alert-coral/10 rounded-lg">
                      <div className="text-2xl font-bold text-alert-coral">
                        {requests.filter((r) => r.urgency === "critical").length}
                      </div>
                      <div className="text-sm text-gray-600">Demandes critiques</div>
                    </div>
                    <div className="text-center p-4 bg-life-green/10 rounded-lg">
                      <div className="text-2xl font-bold text-life-green">
                        {requests.reduce((sum, r) => sum + r.unitsCollected, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Unités collectées</div>
                    </div>
                    <div className="text-center p-4 bg-trust-blue/10 rounded-lg">
                      <div className="text-2xl font-bold text-trust-blue">
                        {requests.reduce((sum, r) => sum + r.unitsNeeded, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Unités nécessaires</div>
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
