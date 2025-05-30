"use client"

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
import { Bell, BellOff, Mail, MessageSquare, Hospital, Search, Shield, Save, Trash2, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

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
  emailNotifications: boolean;
  smsNotifications: boolean;
  subscribedHospitals: string[];
}

// Define types for privacy settings
interface PrivacySettings {
  showOnPublicList: boolean;
  isAnonymous: boolean;
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

// All hospitals data
const allHospitals: Record<string, Hospital> = {
  h1: { id: "h1", name: "CHU Mustapha Pacha", type: "CHU", wilaya: "Alger", urgency: "high" },
  h2: { id: "h2", name: "Hôpital El Kettar", type: "Hôpital spécialisé", wilaya: "Alger", urgency: "medium" },
  h3: { id: "h3", name: "Clinique Ibn Sina", type: "Clinique privée", wilaya: "Alger", urgency: "low" },
  h4: {
    id: "h4",
    name: "Centre de transfusion sanguine d'Alger",
    type: "Centre de transfusion",
    wilaya: "Alger",
    urgency: "high",
  },
  h5: { id: "h5", name: "Hôpital Beni Messous", type: "Hôpital public", wilaya: "Alger", urgency: "medium" },
  h6: { id: "h6", name: "CHU d'Oran", type: "CHU", wilaya: "Oran", urgency: "high" },
  h7: { id: "h7", name: "Hôpital militaire d'Oran", type: "Hôpital militaire", wilaya: "Oran", urgency: "medium" },
  h8: {
    id: "h8",
    name: "Centre de transfusion d'Oran",
    type: "Centre de transfusion",
    wilaya: "Oran",
    urgency: "high",
  },
  h9: { id: "h9", name: "Clinique El Nour", type: "Clinique privée", wilaya: "Oran", urgency: "low" },
  h10: { id: "h10", name: "CHU de Constantine", type: "CHU", wilaya: "Constantine", urgency: "high" },
  h11: { id: "h11", name: "Hôpital Ibn Badis", type: "Hôpital public", wilaya: "Constantine", urgency: "medium" },
  h12: {
    id: "h12",
    name: "Centre de transfusion de Constantine",
    type: "Centre de transfusion",
    wilaya: "Constantine",
    urgency: "high",
  },
  h13: { id: "h13", name: "CHU d'Annaba", type: "CHU", wilaya: "Annaba", urgency: "high" },
  h14: { id: "h14", name: "Hôpital Ibn Rochd", type: "Hôpital public", wilaya: "Annaba", urgency: "medium" },
  h15: { id: "h15", name: "CHU de Blida", type: "CHU", wilaya: "Blida", urgency: "high" },
  h16: { id: "h16", name: "Hôpital Frantz Fanon", type: "Hôpital psychiatrique", wilaya: "Blida", urgency: "low" },
  h17: { id: "h17", name: "CHU de Sétif", type: "CHU", wilaya: "Setif", urgency: "high" },
  h18: { id: "h18", name: "Hôpital El Hidhab", type: "Hôpital public", wilaya: "Setif", urgency: "medium" },
  h19: { id: "h19", name: "CHU de Tlemcen", type: "CHU", wilaya: "Tlemcen", urgency: "high" },
  h20: { id: "h20", name: "Hôpital Dr Tidjani Damerdji", type: "Hôpital public", wilaya: "Tlemcen", urgency: "medium" },
};

export default function NotificationsPage() {
  const { user, updateNotificationPreferences, updatePrivacySettings, unsubscribeFromHospital } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [hospitalToUnsubscribe, setHospitalToUnsubscribe] = useState<Hospital | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enableNotifications: false,
    emailNotifications: false,
    smsNotifications: false,
    subscribedHospitals: [],
  })
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({ 
    showOnPublicList: false, 
    isAnonymous: false 
  })

  useEffect(() => {
    if (user && user.notificationPreferences && user.privacySettings) {
      setNotificationSettings(user.notificationPreferences)
      setPrivacySettings(user.privacySettings)
    }
  }, [user])

  if (!user) return null

  // Get subscribed hospitals
  const subscribedHospitals = notificationSettings.subscribedHospitals
    .map((id) => allHospitals[id])
    .filter(Boolean) as Hospital[]

  // Filter hospitals based on search term
  const filteredHospitals = subscribedHospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.wilaya.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      enableNotifications: enabled,
      subscribedHospitals: enabled ? prev.subscribedHospitals : [],
    }))
  }

  const handleUnsubscribeConfirm = () => {
    if (hospitalToUnsubscribe) {
      unsubscribeFromHospital(hospitalToUnsubscribe.id)
      setNotificationSettings((prev) => ({
        ...prev,
        subscribedHospitals: prev.subscribedHospitals.filter((id) => id !== hospitalToUnsubscribe.id),
      }))

      toast({
        title: "Désabonnement confirmé",
        description: `Vous ne recevrez plus de notifications de ${hospitalToUnsubscribe.name}`,
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      })

      setHospitalToUnsubscribe(null)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      updateNotificationPreferences(notificationSettings)
      updatePrivacySettings(privacySettings)

      toast({
        title: "Paramètres mis à jour",
        description: "Vos préférences ont été sauvegardées avec succès!",
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "Urgences fréquentes"
      case "medium":
        return "Demandes régulières"
      case "low":
        return "Demandes occasionnelles"
      default:
        return "Non spécifié"
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
            <Save className="h-4 w-4 mr-2" />
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
                Paramètres de notification
              </CardTitle>
              <CardDescription>Gérez vos notifications et désabonnez-vous des hôpitaux</CardDescription>
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

                  {/* Notification methods */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Méthodes de notification</h4>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span>Notifications par email</span>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span>Notifications par SMS</span>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, smsNotifications: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Subscribed hospitals management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Hôpitaux abonnés</h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {subscribedHospitals.length} hôpital(aux) abonné(s)
                      </Badge>
                    </div>

                    {subscribedHospitals.length > 0 && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher un hôpital abonné..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    )}

                    {subscribedHospitals.length > 0 ? (
                      filteredHospitals.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {filteredHospitals.map((hospital) => (
                            <div
                              key={hospital.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Hospital className="h-4 w-4 text-hero-red" />
                                  <span className="font-medium">{hospital.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>{hospital.type}</span>
                                  <span>•</span>
                                  <span>{hospital.wilaya}</span>
                                </div>
                                <Badge className={`text-xs mt-1 ${getUrgencyColor(hospital.urgency)}`}>
                                  {getUrgencyText(hospital.urgency)}
                                </Badge>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => setHospitalToUnsubscribe(hospital)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Se désabonner
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
                                      <span className="font-semibold">{hospital.name}</span>?
                                      <br />
                                      <br />
                                      Vous ne recevrez plus de notifications pour les demandes de sang urgentes de cet
                                      hôpital.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setHospitalToUnsubscribe(null)}>
                                      Annuler
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleUnsubscribeConfirm}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Confirmer le désabonnement
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
                          <p>Aucun hôpital trouvé pour "{searchTerm}"</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Hospital className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>Vous n'êtes abonné à aucun hôpital</p>
                        <p className="text-sm mt-1">Visitez la page des hôpitaux pour vous abonner aux notifications</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Settings */}
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

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Résumé de vos préférences</CardTitle>
            <CardDescription>Aperçu de vos paramètres actuels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-hero-red">{subscribedHospitals.length}</div>
                <div className="text-sm text-gray-600">Hôpital(aux) abonné(s)</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-life-green">
                  {notificationSettings.enableNotifications ? "Actif" : "Inactif"}
                </div>
                <div className="text-sm text-gray-600">Statut des notifications</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-trust-blue">
                  {privacySettings.showOnPublicList ? "Public" : "Privé"}
                </div>
                <div className="text-sm text-gray-600">Visibilité du profil</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
