"use client"
import { unsubscribeFromBloodTansfusionCenter } from "@/services/api/bloodDonation/blood-transfusion-service"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
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
  Bell,
  BellOff,
  Hospital,
  Search,
  Shield,
  Save,
  Trash2,
  AlertTriangle,
  Phone,
  MessageSquare,
  Loader2,
  MapPin
} from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getSubscribedBloodTansfusionCenters } from "@/services/api/bloodDonation/blood-transfusion-service"

// Define types for the hospital
interface Hospital {
  id: string;
  name: string;
  type: string;
  wilaya: string;
  urgency: "high" | "medium" | "low";
}

// Define types for notification settings
interface NotificationSettings {
  enableNotifications: boolean;
  subscribedHospitals: string[];
}

// Define types for privacy settings
interface PrivacySettings {
  showOnPublicList: boolean;
  isAnonymous: boolean;
}

// Blood Transfusion Center DTO
interface BloodTransfusionCenterDTO {
  id?: string | null;
  name?: string | null;
  wilayaId?: number | null;
  wilaya?: string | null;
  type?: string | null;
}

// Subscription DTO
interface DonorBloodTransferCenterSubscriptionDTO {
  id?: string | null;
  bloodTansfusionCenterId?: string | null;
  bloodTansfusionCenter?: BloodTransfusionCenterDTO | null;
}

// Simple Switch component with TypeScript props
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  [key: string]: any; // For any additional props
}

const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, ...props }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-hero-red focus:ring-offset-2 ${
      checked ? "bg-hero-red" : "bg-gray-200"
    }`}
    {...props}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
)

export default function NotificationsPage() {
  const { user, updateNotificationPreferences, updatePrivacySettings, unsubscribeFromHospital, updateProfile } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCenters, setLoadingCenters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [hospitalToUnsubscribe, setHospitalToUnsubscribe] = useState<Hospital | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enableNotifications: false,
    subscribedHospitals: [],
  })
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({ 
    showOnPublicList: false, 
    isAnonymous: false 
  })
  const [contactMethod, setContactMethod] = useState<number>(1)
  const [subscribedCenters, setSubscribedCenters] = useState<DonorBloodTransferCenterSubscriptionDTO[]>([])

  useEffect(() => {
    if (user) {
      setNotificationSettings({
        enableNotifications: user.notificationPreferences?.enableNotifications || false,
        subscribedHospitals: user.notificationPreferences?.subscribedHospitals || [],
      })
      
      setPrivacySettings({
        showOnPublicList: !user.donorExcludeFromPublicPortal,
        isAnonymous: user.donorWantToStayAnonymous || false
      })
      
      // Set contact method from user data
      setContactMethod(user.donorContactMethod || 1)
      
      // Fetch subscribed blood transfusion centers
      fetchSubscribedCenters()
    }
  }, [user])
  
  // Function to fetch subscribed blood transfusion centers
  const fetchSubscribedCenters = async () => {
    if (!user?.token) return
    
    setLoadingCenters(true)
    try {
      // Now passing the required query parameters
      const apiCenters = await getSubscribedBloodTansfusionCenters(user.token, 1, 50)
      console.log("Fetched subscribed centers:", apiCenters)
      
      // Map API response to match our local interface
      const mappedCenters: DonorBloodTransferCenterSubscriptionDTO[] = apiCenters.map((center: { id: any; bloodTansfusionCenterId: any; bloodTansfusionCenter: { id: any; name: any; wilayaId: any; wilaya: { name: any } } }) => ({
        id: center.id,
        bloodTansfusionCenterId: center.bloodTansfusionCenterId,
        bloodTansfusionCenter: center.bloodTansfusionCenter ? {
          id: center.bloodTansfusionCenter.id,
          name: center.bloodTansfusionCenter.name,
          wilayaId: center.bloodTansfusionCenter.wilayaId,
          // Extract the wilaya name from the WilayaDTO object
          wilaya: center.bloodTansfusionCenter.wilaya?.name || null,
          // Add type property for display
          type: determineHospitalType(center.bloodTansfusionCenter.name || "")
        } : null
      }))
      
      setSubscribedCenters(mappedCenters)
    } catch (error) {
      console.error("Error fetching subscribed centers:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos centres abonnés.",
        variant: "destructive",
      })
    } finally {
      setLoadingCenters(false)
    }
  }

  // Add this helper function from the hospital page
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

  // Add this helper function for badge colors
  function getTypeBadgeColor(type: string) {
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

  if (!user) return null

  // Filter centers based on search term
  const filteredCenters = subscribedCenters.filter(sub => {
    const center = sub.bloodTansfusionCenter
    if (!center) return false
    
    const searchLower = searchTerm.toLowerCase()
    return (
      (center.name && center.name.toLowerCase().includes(searchLower)) ||
      (center.type && center.type.toLowerCase().includes(searchLower)) ||
      (center.wilaya && center.wilaya.toLowerCase().includes(searchLower))
    )
  })

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      enableNotifications: enabled,
    }))
  }

  // Update the handleUnsubscribeConfirm function to accept parameters directly
  const handleUnsubscribeConfirm = async (subscriptionId: string, hospitalName: string) => {
    if (!subscriptionId) {
      console.error("[NOTIFICATIONS] No subscription ID provided for unsubscribe");
      return;
    }
    
    setIsLoading(true);
    console.log(`[NOTIFICATIONS] Starting unsubscribe process for subscription ID: ${subscriptionId}`);
    
    try {
      if (!user?.token) {
        throw new Error("User token not available");
      }
      
      // Make API call to unsubscribe using the subscription ID
      await unsubscribeFromBloodTansfusionCenter(user.token, subscriptionId);
      
      // Update local state to remove the unsubscribed center
      setSubscribedCenters(prev => prev.filter(sub => sub.id !== subscriptionId));
      
      toast({
        title: "Désabonnement confirmé",
        description: `Vous ne recevrez plus de notifications de ${hospitalName}`,
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      });
      
      // Important: Refetch the subscribed centers to ensure data is fresh
      await fetchSubscribedCenters();
    } catch (error) {
      console.error("[NOTIFICATIONS] Error during unsubscribe:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du désabonnement.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setHospitalToUnsubscribe(null);
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // First update notification preferences
      updateNotificationPreferences(notificationSettings)
      
      // Then update privacy and profile settings
      updatePrivacySettings(privacySettings)
      
      // Create profile update data
      const profileUpdateData = {
        donorWantToStayAnonymous: privacySettings.isAnonymous,
        donorExcludeFromPublicPortal: !privacySettings.showOnPublicList,
        donorAvailability: 1, // Default availability
        donorContactMethod: contactMethod
      };
      
      console.log("Updating profile with contact method:", contactMethod);
      
      // Call the updateProfile function from auth context
      const success = await updateProfile(profileUpdateData);
      
      if (success) {
        toast({
          title: "Paramètres mis à jour",
          description: "Vos préférences ont été sauvegardées avec succès!",
          className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
        })
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-trust-blue">Notifications et Confidentialité</h1>
            <p className="text-gray-500">Gérez vos préférences de notification et de confidentialité</p>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-gradient-to-r from-hero-red to-red-500 hover:from-hero-red/90 hover:to-red-500/90"
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notification Settings */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-hero-red" />
                Centres de transfusion sanguine
              </CardTitle>
              <CardDescription>Gérez vos abonnements aux centres de transfusion sanguine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master notification toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {notificationSettings.enableNotifications ? (
                      <Bell className="h-4 w-4 text-life-green" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="font-medium">Activer les notifications</span>
                  </div>
                  <p className="text-sm text-gray-500">Recevez des notifications pour les demandes de sang urgentes</p>
                </div>
                <Switch checked={notificationSettings.enableNotifications} onCheckedChange={handleNotificationToggle} />
              </div>

              {notificationSettings.enableNotifications && (
                <>
                  <Separator />

                  {/* Subscribed centers management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Centres de transfusion abonnés</h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {subscribedCenters.length} centre(s) abonné(s)
                      </Badge>
                    </div>

                    {loadingCenters ? (
                      <div className="text-center py-6 text-gray-500">
                        <Loader2 className="h-8 w-8 mx-auto mb-2 text-gray-300 animate-spin" />
                        <p>Chargement des centres abonnés...</p>
                      </div>
                    ) : (
                      <>
                        {subscribedCenters.length > 0 && (
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Rechercher un centre abonné..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        )}

                        {subscribedCenters.length > 0 ? (
                          filteredCenters.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {filteredCenters.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Hospital className="h-4 w-4 text-hero-red" />
                                      <span className="font-medium">{sub.bloodTansfusionCenter?.name}</span>
                                      {sub.bloodTansfusionCenter?.type && (
                                        <Badge className={`${getTypeBadgeColor(sub.bloodTansfusionCenter.type)} text-xs`}>
                                          {sub.bloodTansfusionCenter.type === "public" ? "Public" : 
                                           sub.bloodTansfusionCenter.type === "private" ? "Privé" : "Centre"}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      {sub.bloodTansfusionCenter?.wilaya && (
                                        <>
                                          <MapPin className="h-3 w-3" />
                                          <span>{sub.bloodTansfusionCenter.wilaya}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        id={`unsubscribe-btn-${sub.id}`}
                                        variant="outline"
                                        size="icon"
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                      >
                                        <BellOff className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                          <AlertTriangle className="h-5 w-5 text-red-500" />
                                          Confirmer le désabonnement
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Êtes-vous sûr de vouloir vous désabonner des notifications de{" "}
                                          <span className="font-semibold">{sub.bloodTansfusionCenter?.name || "ce centre"}</span>?
                                          <br />
                                          <br />
                                          Vous ne recevrez plus de notifications pour les demandes de sang urgentes de ce
                                          centre.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Annuler
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            
                                            // Get the BTC ID (not the subscription ID)
                                            const btcId = sub.bloodTansfusionCenterId || "";
                                            const hospitalName = sub.bloodTansfusionCenter?.name || "Centre inconnu";
                                            
                                            console.log("[NOTIFICATIONS] Confirm button clicked, BTC ID:", btcId);
                                            
                                            // Call unsubscribe with the BTC ID
                                            handleUnsubscribeConfirm(btcId, hospitalName);
                                          }}
                                          className="bg-red-600 hover:bg-red-700"
                                          disabled={isLoading}
                                        >
                                          {isLoading ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Traitement...
                                            </>
                                          ) : (
                                            "Confirmer le désabonnement"
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p>Aucun centre trouvé pour "{searchTerm}"</p>
                            </div>
                          )
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <Hospital className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>Vous n'êtes abonné à aucun centre de transfusion</p>
                            <p className="text-sm mt-1">Visitez la page des hôpitaux pour vous abonner aux notifications</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Settings - keep this section unchanged */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-hope-purple" />
                Paramètres de confidentialité
              </CardTitle>
              <CardDescription>
                Contrôlez la visibilité de votre profil et vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Apparaître dans la liste publique</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Permettre aux utilisateurs non connectés de voir votre profil dans la liste des donneurs
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showOnPublicList}
                  onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, showOnPublicList: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-medium">Mode anonyme</span>
                  <p className="text-sm text-gray-500">Masquer votre nom complet et afficher seulement vos initiales</p>
                </div>
                <Switch
                  checked={privacySettings.isAnonymous}
                  onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, isAnonymous: checked }))}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="font-medium">Méthode de contact préférée</span>
                  <p className="text-sm text-gray-500">Comment souhaitez-vous être contacté pour les dons?</p>
                </div>
                
                <RadioGroup 
                  value={contactMethod.toString()} 
                  onValueChange={(value) => setContactMethod(parseInt(value))}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 rounded-lg border p-3 transition-colors hover:bg-gray-50">
                    <RadioGroupItem value="1" id="contact-phone" className="text-hero-red" />
                    <label htmlFor="contact-phone" className="flex flex-1 items-center gap-2 cursor-pointer">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span>Appel téléphonique uniquement</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2 rounded-lg border p-3 transition-colors hover:bg-gray-50">
                    <RadioGroupItem value="2" id="contact-text" className="text-hero-red" />
                    <label htmlFor="contact-text" className="flex flex-1 items-center gap-2 cursor-pointer">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <span>Message texte uniquement</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2 rounded-lg border p-3 transition-colors hover:bg-gray-50">
                    <RadioGroupItem value="3" id="contact-both" className="text-hero-red" />
                    <label htmlFor="contact-both" className="flex flex-1 items-center gap-2 cursor-pointer">
                      <div className="flex">
                        <Phone className="h-4 w-4 text-purple-500 mr-1" />
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                      </div>
                      <span>Les deux méthodes</span>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2">Aperçu de votre profil public</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Nom affiché:</span>
                    <span className="font-medium">
                      {privacySettings.isAnonymous
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("") + "."
                        : user.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Visible publiquement:</span>
                    <span className="font-medium">{privacySettings.showOnPublicList ? "Oui" : "Non"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Groupe sanguin:</span>
                    <span className="font-medium">{user.bloodType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Wilaya:</span>
                    <span className="font-medium">{user.wilaya}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
