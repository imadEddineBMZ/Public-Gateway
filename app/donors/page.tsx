"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MapPin, Heart, Award, Phone, Mail, UserPlus, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { 
  getPublicNonAnonymousDonors,
  getAllNonAnonymousDonors,
  getWilayas 
} from "@/services/api-service"

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
          const mappedDonors: Donor[] = donorsData.map(donor => ({
            id: donor.id || "",
            name: donor.firstName && donor.lastName 
              ? `${donor.firstName} ${donor.lastName}`
              : donor.username || "Donneur anonyme",
            bloodType: donor.donorBloodGroup || "?",
            wilaya: donor.wilaya?.name || "Non spécifiée",
            lastDonation: donor.lastDonatedAt || null,
            totalDonations: donor.donorDonationCount || 0,
            isEligible: donor.donorCanDonateNow || false,
            badges: getBadges(donor.donorDonationCount || 0),
            avatar: donor.profilePictureUrl || undefined,
            contactInfo: {
              email: donor.email || "",
              phone: donor.phoneNumber || "",
            },
            privacySettings: {
              isAnonymous: donor.donorWantToStayAnonymous || false,
              showOnPublicList: !donor.donorExcludedFromPublicPortal,
            },
          }))
          
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
          description: "Impossible de charger les donneurs. Veuillez réessayer plus tard.",
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

  const getInitials = (donor: Donor) => {
    return donor.name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

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
                  <span className="font-medium">Bienvenue dans la communauté, {user.name.split(" ")[0]}!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Vous avez accès à toutes les informations des donneurs et pouvez gérer vos préférences depuis votre
                  tableau de bord.
                </p>
              </div>
            )}
          </div>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Rechercher des donneurs</CardTitle>
              <CardDescription>Filtrez les donneurs par nom, groupe sanguin ou wilaya</CardDescription>
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
                  {filteredDonors.map((donor, index) => (
                    <motion.div
                      key={donor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={donor.avatar || "/placeholder.svg"} alt={getDisplayName(donor)} />
                              <AvatarFallback className="bg-gradient-to-br from-hero-red to-red-600 text-white">
                                {getInitials(donor)}
                              </AvatarFallback>
                            </Avatar>
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
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Dons totaux:</span>
                              <p className="font-semibold">{donor.totalDonations}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Dernier don:</span>
                              <p className="font-semibold">
                                {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString("fr-FR") : "Aucun"}
                              </p>
                            </div>
                          </div>

                          {/* Contact Information - Enhanced visibility for authenticated users */}
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">
                                {user
                                  ? donor.contactInfo.email
                                  : donor.contactInfo.email.replace(/(.{2}).*(@.*)/, "$1***$2")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3.5 w-3.5" />
                              <span>
                                {user
                                  ? donor.contactInfo.phone
                                  : donor.contactInfo.phone.replace(/(.{4}).*(.{2})/, "$1***$2")}
                              </span>
                            </div>
                            {!user && (
                              <p className="text-xs text-gray-500 italic">
                                Connectez-vous pour voir les informations complètes
                              </p>
                            )}
                          </div>

                          {donor.badges.length > 0 && (
                            <div>
                              <span className="text-sm text-gray-500 mb-2 block">Badges:</span>
                              <div className="flex flex-wrap gap-1">
                                {donor.badges.slice(0, 2).map((badge, badgeIndex) => (
                                  <Badge
                                    key={badgeIndex}
                                    variant="outline"
                                    className="text-xs bg-gold-badge/20 text-trust-blue border-gold-badge/30"
                                  >
                                    <Award className="h-3 w-3 mr-1" />
                                    {badge}
                                  </Badge>
                                ))}
                                {donor.badges.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{donor.badges.length - 2}
                                  </Badge>
                                )}
                              </div>
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
                      <div className="text-2xl font-bold text-hope-purple">{new Set(donors.map((d) => d.wilaya)).size}</div>
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
