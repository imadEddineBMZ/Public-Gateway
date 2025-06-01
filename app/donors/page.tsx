"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MapPin, Heart, Award, UserPlus, Loader2, CircleUser, PhoneCall, MessageSquare, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { 
  getPublicNonAnonymousDonors,
  getAllNonAnonymousDonors,
  getWilayas 
} from "@/services/api-service"

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

// Contact Method Mapping
const CONTACT_METHOD_MAP = {
  1: "Appel téléphonique",
  2: "Message texte",
  3: "Tous les moyens"
};

// Types pour les donneurs
type Donor = {
  id: string
  name: string
  bloodType: string
  wilaya: string
  lastDonation: string | null
  totalDonations: number
  isEligible: boolean
  badges: string[]
  avatar?: string
  contactInfo: {
    email: string
    phone: string
    contactMethod?: number // Add contact method field
  }
  privacySettings: {
    isAnonymous: boolean
    showOnPublicList: boolean
  }
}

export default function DonorsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all")
  const [wilayaFilter, setWilayaFilter] = useState<string>("all")
  const [donors, setDonors] = useState<Donor[]>([])
  const [wilayas, setWilayas] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch donors based on authentication status
        const donorsData = user?.token
          ? await getAllNonAnonymousDonors(user.token, 2)
          : await getPublicNonAnonymousDonors(1)
        
        console.log("API donors response:", donorsData);
        
        // Map API data to our Donor format
        if (donorsData && Array.isArray(donorsData)) {
          const mappedDonors: Donor[] = donorsData.map((donor, index) => {
            // Create a stable ID that won't change between renders
            const stableId = donor.id || 
                            `donor-${donor.username || ''}${donor.email || ''}${index}`;
            
            // Map blood group numeric value to string representation
            const bloodGroupString = donor.donorBloodGroup 
              ? BLOOD_GROUP_MAP[donor.donorBloodGroup as keyof typeof BLOOD_GROUP_MAP] || "?"
              : "?";
            
            return {
              id: stableId,
              // FIX: Use donorName instead of firstName/lastName
              name: donor.donorName || donor.username || "Donneur anonyme",
              bloodType: bloodGroupString,
              wilaya: donor.wilaya?.name || "Non spécifiée",
              lastDonation: donor.donorLastDonationDate || null,
              totalDonations: donor.donorDonationCount || 0,
              isEligible: donor.donorCanDonateNow || false,
              badges: getBadges(donor.donorDonationCount || 0),
              avatar: donor.profilePictureUrl || undefined,
              contactInfo: {
                email: donor.email || "",
                phone: donor.donorTel || "",
                // Use nullish coalescing instead of logical OR to handle 0 value correctly
                contactMethod: donor.donorContactMethod ?? null,
              },
              privacySettings: {
                // FIX: Handle null values correctly with nullish coalescing
                isAnonymous: donor.donorWantToStayAnonymous ?? false,
                showOnPublicList: !(donor.donorExcludeFromPublicPortal ?? false),
              },
            };
          })
          
          setDonors(mappedDonors)
        } else {
          console.error("Unexpected data format:", donorsData)
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
          description: "Impossible de charger la liste des donneurs. Veuillez réessayer plus tard.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [toast, user])
  
  // Helper function to generate badges based on donation count
  function getBadges(donationCount: number): string[] {
    const badges = []
    
    if (donationCount >= 1) badges.push("Premier Sauvetage")
    if (donationCount >= 5) badges.push("Donneur Régulier")
    if (donationCount >= 10) badges.push("Sauveur de Vies")
    if (donationCount >= 15) badges.push("Héros du Sang")
    
    return badges
  }

  // Filtrer les donneurs
  const filteredDonors = donors.filter((donor) => {
    const displayName = donor.privacySettings.isAnonymous
      ? donor.name
          .split(" ")
          .map((n) => n[0])
          .join("") + "."
      : donor.name

    const matchesSearchTerm =
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.wilaya.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBloodType = bloodTypeFilter === "all" || donor.bloodType === bloodTypeFilter
    const matchesWilaya = wilayaFilter === "all" || donor.wilaya === wilayaFilter

    return matchesSearchTerm && matchesBloodType && matchesWilaya
  })

  const getDisplayName = (donor: Donor) => {
    return donor.privacySettings.isAnonymous
      ? donor.name
          .split(" ")
          .map((n) => n[0])
          .join("") + "."
      : donor.name
  }

  // Update the getInitials function to better handle various name formats
  const getInitials = (donor: Donor): string => {
    if (!donor.name || donor.name.trim() === "") {
      return "?";
    }
    
    // Split by spaces and get first character of each part
    return donor.name
      .split(" ")
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .join("")
      .substring(0, 2); // Limit to 2 characters
  }

  // Format Algerian phone number to make it more readable
  const formatPhoneNumber = (phone: string): string => {
    if (!phone || phone.length < 4) return phone;
    
    // Format as XX XX XX XX XX (common Algerian format)
    return phone.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  };

  // Mask phone number for privacy when user is not authenticated
  const maskPhoneNumber = (phone: string): string => {
    if (!phone || phone.length < 4) return "***";
    
    // Keep first 2 digits and last 2 digits visible
    return phone.replace(/^(\d{2}).*(\d{2})$/, "$1 ** ** ** $2");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50">
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
            <h1 className="text-4xl font-bold text-trust-blue">Nos Donneurs</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez notre communauté de donneurs de sang dévoués qui sauvent des vies à travers l'Algérie.
            </p>
            {!user ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 text-blue-800">
                  <UserPlus className="h-5 w-5" />
                  <span className="font-medium">Rejoignez notre communauté</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Créez un compte pour accéder à plus d'informations sur les donneurs et gérer vos préférences.{" "}
                  <Link href="/register" className="underline hover:text-blue-900 font-medium">
                    S'inscrire maintenant
                  </Link>
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 text-green-800">
                  <Heart className="h-5 w-5" />
                  <span className="font-medium">Bienvenue, {user.name}</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Vous avez accès aux informations de contact complètes des donneurs.
                </p>
              </div>
            )}
          </div>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Rechercher des donneurs</CardTitle>
              <CardDescription>Filtrez par groupe sanguin, wilaya ou recherchez par nom</CardDescription>
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
                      placeholder="Nom ou wilaya..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
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
                      <SelectItem key="all-blood-types" value="all">Tous les groupes</SelectItem>
                      {bloodTypes.map((type, index) => (
                        <SelectItem key={`blood-type-${type}-${index}`} value={type}>
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
                      <SelectItem key="all-wilayas" value="all">Toutes les wilayas</SelectItem>
                      {wilayas.map((wilaya, index) => (
                        <SelectItem key={`wilaya-${wilaya}-${index}`} value={wilaya}>
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
              <span className="ml-2 text-lg">Chargement des donneurs...</span>
            </div>
          ) : (
            <>
              {/* Liste des donneurs */}
              {filteredDonors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <p className="text-gray-500">Aucun donneur ne correspond à vos critères de recherche.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDonors.map((donor, donorIndex) => {
                    // Generate a highly unique key for each donor card
                    const donorKey = `donor-${donor.id || ''}-${donor.bloodType || ''}-${donorIndex}`;
                    
                    return (
                      <motion.div
                        key={donorKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow duration-300">
                          {/* Card content */}
                          <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                              {donor.avatar ? (
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={donor.avatar} alt={getDisplayName(donor)} />
                                  <AvatarFallback className="bg-gradient-to-br from-hero-red to-red-600 text-white">
                                    {getInitials(donor)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <CircleUser className="h-12 w-12 text-gray-400" />
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold">{getDisplayName(donor)}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{donor.wilaya}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-hero-red font-semibold">
                                  {donor.bloodType}
                                </div>
                                <Badge variant={donor.isEligible ? "default" : "secondary"} className="text-xs">
                                  {donor.isEligible ? "Éligible" : "Non éligible"}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 gap-4 text-sm">
                              {/* Remove the donations count and only show the last donation date */}
                              <div>
                                <span className="text-gray-500">Dernier don:</span>
                                <p className="font-semibold">
                                  {donor.lastDonation ? 
                                    new Date(donor.lastDonation).toLocaleDateString("fr-FR", {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }).replace(",", " à") : 
                                    "Non disponible"}
                                </p>
                              </div>
                            </div>

                            {/* Contact Information - Enhanced visibility for authenticated users */}
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                
                                <span className="truncate">
                                  {user
                                    ? donor.contactInfo.email
                                    : donor.contactInfo.email.replace(/(.{2}).*(@.*)/, "$1***$2")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span>
                                  {user
                                    ? formatPhoneNumber(donor.contactInfo.phone || "")
                                    : maskPhoneNumber(donor.contactInfo.phone || "")}
                                </span>
                              </div>

                              {/* Display contact method preference for authenticated users */}
                              {user && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  {donor.contactInfo.contactMethod === 1 ? (
                                    <>
                                      <PhoneCall className="h-3.5 w-3.5 text-blue-500" />
                                      <span className="text-xs font-medium">
                                        Préfère: Appel téléphonique
                                      </span>
                                    </>
                                  ) : donor.contactInfo.contactMethod === 2 ? (
                                    <>
                                      <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                                      <span className="text-xs font-medium">
                                        Préfère: Message texte
                                      </span>
                                    </>
                                  ) : donor.contactInfo.contactMethod === 3 ? (
                                    <>
                                      <div className="flex">
                                        <PhoneCall className="h-3.5 w-3.5 text-purple-500 mr-1" />
                                        <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                                      </div>
                                      <span className="text-xs font-medium">
                                        Préfère: Les deux méthodes
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex">
                                        <PhoneCall className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                        <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                                      </div>
                                      <span className="text-xs font-medium text-gray-500">
                                        Préférence non spécifiée
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {!user && (
                                <p className="text-xs text-gray-500 italic">
                                  Connectez-vous pour voir les informations complètes
                                </p>
                              )}
                            </div>

                            {/* Fix badges rendering with better keys */}
                            {donor.badges.length > 0 && (
                              <div>
                                <span className="text-sm text-gray-500 mb-2 block">Badges:</span>
                                <div className="flex flex-wrap gap-1">
                                  {donor.badges.slice(0, 2).map((badge, badgeIndex) => (
                                    <Badge
                                      key={`${donorKey}-badge-${badge}-${badgeIndex}`}
                                      variant="outline"
                                      className="text-xs bg-gold-badge/20 text-trust-blue border-gold-badge/30"
                                    >
                                      <Award className="h-3 w-3 mr-1" />
                                      {badge}
                                    </Badge>
                                  ))}
                                  {donor.badges.length > 2 && (
                                    <Badge key={`${donorKey}-badge-more`} variant="outline" className="text-xs">
                                      +{donor.badges.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Statistiques */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques des donneurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-hero-red">{donors.length}</div>
                      <div className="text-sm text-gray-600">Donneurs {user ? "inscrits" : "publics"}</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-life-green">{donors.filter((d) => d.isEligible).length}</div>
                      <div className="text-sm text-gray-600">Donneurs éligibles</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-trust-blue">
                        {donors.reduce((sum, d) => sum + d.totalDonations, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Dons totaux</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {donors.filter((d) => d.lastDonation).length}
                      </div>
                      <div className="text-sm text-gray-600">Donneurs actifs</div>
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
