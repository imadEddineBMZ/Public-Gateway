"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import {
  fetchUserPledges,
  cancelPledge,
  
} from "@/services/api-service"
import { updatePledge } from "@/services/api/pledges/pledges-service"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarIcon, MapPin, Phone, User } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fr } from "date-fns/locale";

// Define the Pledge types
type PledgeStatus = "active" | "completed" | "cancelled";

type Pledge = {
  id: string;
  requestId: string;
  hospitalName: string;
  bloodType: string;
  pledgeDate: string;
  appointmentDate: string | null;
  status: PledgeStatus;
  location: string;
  contactInfo: {
    phone: string;
    contactPerson: string;
  };
};

// Map API status to UI status
const STATUS_MAP: Record<number, PledgeStatus> = {
  0: "active", // Initiated
  1: "completed", // Honored
  2: "cancelled", // CanceledByInitiator
  3: "cancelled", // CanceledByServiceNotNeeded
  4: "cancelled", // CanceledByServiceCantBeDone
  5: "cancelled"  // CanceledTimeout
};

export default function PledgesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("active")
  const [cancelReason, setCancelReason] = useState("")
  const [pledges, setPledges] = useState<Pledge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [pledgeToUpdate, setPledgeToUpdate] = useState<string | null>(null)
  const [dateDialogOpen, setDateDialogOpen] = useState(false)

  // Check if we're coming from a new pledge creation
  useEffect(() => {
    const isNewPledge = searchParams?.get('new') === 'true'
    if (isNewPledge) {
      toast({
        title: "Engagement créé avec succès",
        description: "Merci pour votre engagement à donner du sang. Vous serez contacté par l'hôpital.",
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      })
    }
  }, [searchParams, toast])

  // Fetch user pledges
  useEffect(() => {
    async function loadPledges() {
      if (!user?.token) {
        router.push('/login')
        return
      }

      setIsLoading(true)
      try {
        // Explicitly request all pledges, including active ones (status 0)
        const pledgesData = await fetchUserPledges(user.token, {
          // Don't filter by evolutionStatus to get ALL pledges
          paginationTake: 100  // Get a large number to ensure we don't miss any
        })
        
        console.log('Fetched pledges:', pledgesData)

        if (pledgesData && Array.isArray(pledgesData)) {
          // Map API data to UI format
          const mappedPledges: Pledge[] = pledgesData.map(pledge => ({
            id: pledge.id || `pledge-${Math.random().toString(36).substring(2, 9)}`,
            requestId: pledge.bloodDonationRequestId || "",
            hospitalName: pledge.bloodDonationRequest?.bloodTansfusionCenter?.name || "Hôpital",
            bloodType: mapBloodGroup(pledge.bloodDonationRequest?.bloodGroup),
            pledgeDate: formatDate(pledge.pledgeInitiatedDate || pledge.pledgeDate),
            appointmentDate: pledge.pledgeDate ? formatDate(pledge.pledgeDate) : null,
            status: STATUS_MAP[pledge.evolutionStatus || 0] || "active",
            location: pledge.bloodDonationRequest?.bloodTansfusionCenter?.wilaya?.name || "Non spécifié",
            contactInfo: {
              phone: pledge.bloodDonationRequest?.bloodTansfusionCenter?.tel || "",
              contactPerson: "Service de transfusion"
            }
          }))

          setPledges(mappedPledges)
        }
      } catch (error) {
        console.error("Error loading pledges:", error)
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger vos engagements. Veuillez réessayer plus tard.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPledges()
  }, [user, router, toast])

  const handleCancelPledge = async (pledgeId: string) => {
    if (!user?.token) return

    if (!cancelReason) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une raison d'annulation.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await cancelPledge(user.token, pledgeId, cancelReason)

      // Update local state
      setPledges(
        pledges.map((pledge) => (pledge.id === pledgeId ? { ...pledge, status: "cancelled" as PledgeStatus } : pledge)),
      )

      toast({
        title: "Engagement annulé",
        description: "Votre engagement a été annulé avec succès.",
      })
    } catch (error) {
      console.error("Error cancelling pledge:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompletePledge = async (pledgeId: string) => {
    if (!user?.token) return

    try {
      setIsLoading(true)
      await updatePledge(user.token, pledgeId, {
        evolutionStatus: 1, // Set to "completed" (honored)
        pledgeDate: new Date()
      })

      // Update local state
      setPledges(
        pledges.map((pledge) => (pledge.id === pledgeId ? { ...pledge, status: "completed" as PledgeStatus } : pledge)),
      )

      toast({
        title: "Félicitations!",
        description: "Votre don a été marqué comme complété. Merci pour votre générosité!",
      })
    } catch (error) {
      console.error("Error completing pledge:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle date updates
  const handleUpdatePledgeDate = async () => {
    if (!user?.token || !pledgeToUpdate || !selectedDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date valide.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Make sure the date is in the future (API requirement)
      if (selectedDate < new Date()) {
        toast({
          title: "Date invalide",
          description: "Veuillez sélectionner une date future.",
          variant: "destructive",
        })
        return
      }
      
      // Update the pledge with the new date
      await updatePledge(user.token, pledgeToUpdate, {
        evolutionStatus: 0, // Keep status as active/initiated
        pledgeDate: selectedDate
      })

      // Update local state
      setPledges(
        pledges.map((pledge) => 
          pledge.id === pledgeToUpdate 
            ? { 
                ...pledge, 
                appointmentDate: formatDate(selectedDate)
              } 
            : pledge
        )
      )

      // Close dialog and reset state
      setDateDialogOpen(false)
      setPledgeToUpdate(null)
      setSelectedDate(undefined)

      toast({
        title: "Date mise à jour",
        description: "La date de votre engagement a été mise à jour avec succès.",
      })
    } catch (error) {
      console.error("Error updating pledge date:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la date.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to open date dialog
  const openDateDialog = (pledgeId: string) => {
    setPledgeToUpdate(pledgeId)
    
    // Set default date to current appointment date or tomorrow
    const pledge = pledges.find(p => p.id === pledgeId)
    const defaultDate = pledge?.appointmentDate 
      ? new Date(pledge.appointmentDate) 
      : new Date(Date.now() + 86400000) // Tomorrow
    
    setSelectedDate(defaultDate)
    setDateDialogOpen(true)
  }

  // Helper function to format dates
  function formatDate(dateString?: string | Date | null): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  }

  // Helper function to map blood group numbers to strings
  function mapBloodGroup(groupNumber?: number): string {
    const BLOOD_GROUP_MAP: Record<number, string> = {
      1: "AB+", 2: "AB-", 3: "A+", 4: "A-",
      5: "B+", 6: "B-", 7: "O+", 8: "O-"
    };
    return groupNumber ? BLOOD_GROUP_MAP[groupNumber] || "?" : "?";
  }

  const filteredPledges = pledges.filter((pledge) => {
    if (activeTab === "active") return pledge.status === "active"
    if (activeTab === "completed") return pledge.status === "completed"
    if (activeTab === "cancelled") return pledge.status === "cancelled"
    return true
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-hero-red" />
        <span className="ml-2">Chargement de vos engagements...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-trust-blue">Mes engagements</h1>
          <p className="text-gray-500">Gérez vos engagements de don de sang</p>
        </div>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="completed">Complétés</TabsTrigger>
          <TabsTrigger value="cancelled">Annulés</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {filteredPledges.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-gray-500 mb-4">Vous n'avez pas d'engagements actifs.</p>
                <Link href="/dashboard/requests">
                  <Button className="bg-hero-red hover:bg-hero-red/90 text-white">Parcourir les demandes</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPledges.map((pledge) => (
                <Card key={pledge.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pledge.hospitalName}</CardTitle>
                        <CardDescription>
                          Engagement pris le {new Date(pledge.pledgeDate).toLocaleDateString("fr-FR")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-hero-red font-semibold">
                          {pledge.bloodType}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">Lieu</p>
                            <p className="text-sm text-gray-500">{pledge.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">Rendez-vous</p>
                            <p className="text-sm text-gray-500">
                              {pledge.appointmentDate
                                ? new Date(pledge.appointmentDate).toLocaleDateString("fr-FR")
                                : "Non programmé"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">Contact</p>
                            <p className="text-sm text-gray-500">{pledge.contactInfo.contactPerson}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">Téléphone</p>
                            <p className="text-sm text-gray-500">{pledge.contactInfo.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      {/* Replace the regular Button with the DialogTrigger */}
                      <Button 
                        onClick={() => openDateDialog(pledge.id)}
                        className="flex-1 bg-green-500 hover:bg-green-400 text-white"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span className="font-semibold">Modifier la date</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="flex-1 border-hero-red text-hero-red hover:bg-red-50">
                            Annuler l'engagement
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Annuler l'engagement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Veuillez indiquer la raison de l'annulation de votre engagement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-4">
                            <Select value={cancelReason} onValueChange={setCancelReason}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une raison" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="illness">Je suis malade</SelectItem>
                                <SelectItem value="schedule">Conflit d'horaire</SelectItem>
                                <SelectItem value="transport">Problème de transport</SelectItem>
                                <SelectItem value="other">Autre raison</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setCancelReason("")}>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelPledge(pledge.id)}
                              className="bg-hero-red hover:bg-hero-red/90"
                            >
                              Confirmer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {filteredPledges.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-gray-500">Vous n'avez pas d'engagements complétés.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPledges.map((pledge) => (
                <Card key={pledge.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pledge.hospitalName}</CardTitle>
                        <CardDescription>
                          Complété le {new Date(pledge.appointmentDate || "").toLocaleDateString("fr-FR")}
                        </CardDescription>
                      </div>
                      <Badge className="bg-life-green">Complété</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-hero-red font-semibold">
                        {pledge.bloodType}
                      </div>
                      <div>
                        <p className="font-medium">{pledge.location}</p>
                        <p className="text-sm text-gray-500">
                          Engagement pris le {new Date(pledge.pledgeDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Merci pour votre générosité! Votre don a aidé à sauver des vies.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {filteredPledges.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-gray-500">Vous n'avez pas d'engagements annulés.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPledges.map((pledge) => (
                <Card key={pledge.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pledge.hospitalName}</CardTitle>
                        <CardDescription>Annulé le {new Date().toLocaleDateString("fr-FR")}</CardDescription>
                      </div>
                      <Badge variant="destructive">Annulé</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-hero-red font-semibold">
                        {pledge.bloodType}
                      </div>
                      <div>
                        <p className="font-medium">{pledge.location}</p>
                        <p className="text-sm text-gray-500">
                          Engagement pris le {new Date(pledge.pledgeDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Date Update Dialog */}
      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la date de l'engagement</DialogTitle>
            <DialogDescription>
              Sélectionnez une nouvelle date pour votre engagement. Assurez-vous que la date est dans le futur.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date)}
              className="border rounded-md"
              locale={fr}
              fromDate={new Date(Date.now() + 86400000)} // Changed minDate to fromDate
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleUpdatePledgeDate}
              className="bg-hero-red hover:bg-hero-red/90 text-white"
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
