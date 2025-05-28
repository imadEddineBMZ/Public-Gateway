"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Phone, User } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"

// Types pour les engagements
type PledgeStatus = "active" | "completed" | "cancelled"
type Pledge = {
  id: string
  requestId: string
  hospitalName: string
  bloodType: string
  pledgeDate: string
  appointmentDate: string | null
  status: PledgeStatus
  location: string
  contactInfo: {
    phone: string
    contactPerson: string
  }
}

export default function PledgesPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("active")
  const [cancelReason, setCancelReason] = useState("")
  const [pledges, setPledges] = useState<Pledge[]>([
    {
      id: "pledge-001",
      requestId: "req-001",
      hospitalName: "Hôpital Central",
      bloodType: "O+",
      pledgeDate: "2024-05-20",
      appointmentDate: "2024-05-22",
      status: "active",
      location: "Alger",
      contactInfo: {
        phone: "021 23 45 67",
        contactPerson: "Dr. Ahmed",
      },
    },
    {
      id: "pledge-002",
      requestId: "req-002",
      hospitalName: "Clinique El Azhar",
      bloodType: "O+",
      pledgeDate: "2024-02-15",
      appointmentDate: "2024-02-18",
      status: "completed",
      location: "Alger",
      contactInfo: {
        phone: "021 34 56 78",
        contactPerson: "Dr. Fatima",
      },
    },
    {
      id: "pledge-003",
      requestId: "req-003",
      hospitalName: "Hôpital Universitaire",
      bloodType: "O+",
      pledgeDate: "2024-01-10",
      appointmentDate: "2024-01-12",
      status: "cancelled",
      location: "Alger",
      contactInfo: {
        phone: "021 45 67 89",
        contactPerson: "Dr. Karim",
      },
    },
  ])

  const handleCancelPledge = (pledgeId: string) => {
    if (!cancelReason) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une raison d'annulation.",
        variant: "destructive",
      })
      return
    }

    // Mettre à jour l'état des engagements
    setPledges(
      pledges.map((pledge) => (pledge.id === pledgeId ? { ...pledge, status: "cancelled" as PledgeStatus } : pledge)),
    )

    toast({
      title: "Engagement annulé",
      description: "Votre engagement a été annulé avec succès.",
    })
  }

  const handleCompletePledge = (pledgeId: string) => {
    // Mettre à jour l'état des engagements
    setPledges(
      pledges.map((pledge) => (pledge.id === pledgeId ? { ...pledge, status: "completed" as PledgeStatus } : pledge)),
    )

    toast({
      title: "Félicitations!",
      description: "Votre don a été marqué comme complété. Merci pour votre générosité!",
    })
  }

  const filteredPledges = pledges.filter((pledge) => {
    if (activeTab === "active") return pledge.status === "active"
    if (activeTab === "completed") return pledge.status === "completed"
    if (activeTab === "cancelled") return pledge.status === "cancelled"
    return true
  })

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
                          <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
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
                      <Button
                        className="flex-1 bg-life-green hover:bg-life-green/90 text-white"
                        onClick={() => handleCompletePledge(pledge.id)}
                      >
                        Marquer comme complété
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
    </div>
  )
}
