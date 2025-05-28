"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const wilayas = [
  "Adrar",
  "Alger",
  "Annaba",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Blida",
  "Bouira",
  "Boumerdès",
  "Chlef",
  "Constantine",
  "Djelfa",
  "El Bayadh",
  "El Oued",
  "El Tarf",
  "Ghardaïa",
  "Guelma",
  "Illizi",
  "Jijel",
  "Khenchela",
  "Laghouat",
  "Mascara",
  "Médéa",
  "Mila",
  "Mostaganem",
  "M'Sila",
  "Naâma",
  "Oran",
  "Ouargla",
  "Oum El Bouaghi",
  "Relizane",
  "Saïda",
  "Sétif",
  "Sidi Bel Abbès",
  "Skikda",
  "Souk Ahras",
  "Tamanrasset",
  "Tébessa",
  "Tiaret",
  "Tindouf",
  "Tipaza",
  "Tissemsilt",
  "Tizi Ouzou",
  "Tlemcen",
]

// Schéma de validation pour le formulaire
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit comporter au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phone: z.string().optional(),
  bloodType: z.string().min(1, {
    message: "Veuillez sélectionner votre groupe sanguin.",
  }),
  wilaya: z.string().min(1, {
    message: "Veuillez sélectionner votre wilaya.",
  }),
  lastDonation: z.string().optional(),
  weight: z.string().optional(),
  chronicConditions: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Données simulées du profil
  const defaultValues: Partial<ProfileFormValues> = {
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bloodType: user?.bloodType || "",
    wilaya: user?.wilaya || "",
    lastDonation: user?.lastDonation || "",
    weight: "",
    chronicConditions: "",
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)

    // Simuler une mise à jour du profil
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      })
    }, 1500)
  }

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U"

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-trust-blue">Profil</h1>
            <p className="text-gray-500">Gérez vos informations personnelles</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
          <TabsTrigger value="medical">Informations médicales</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles. Ces informations seront partagées avec les hôpitaux lorsque vous
                vous engagez à donner du sang.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src="/images/donor-avatar.png" alt="Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-hero-red to-red-600 text-white text-xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <h3 className="text-lg font-medium">{user?.name || "Utilisateur"}</h3>
                    {user?.badges && user.badges.length > 0 && (
                      <Badge variant="outline" className="w-fit bg-gold-badge/20 text-trust-blue border-gold-badge/30">
                        {user.badges[0]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Membre depuis mai 2024</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1 hover:bg-red-50 hover:text-hero-red">
                      <Upload className="h-4 w-4" />
                      Changer la photo
                    </Button>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11" />
                        </FormControl>
                        <FormDescription>
                          Votre numéro de téléphone sera utilisé pour vous contacter en cas d'urgence.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wilaya"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wilaya</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Sélectionnez votre wilaya" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wilayas.map((wilaya) => (
                              <SelectItem key={wilaya} value={wilaya}>
                                {wilaya}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Vous verrez les demandes de sang dans votre wilaya et à proximité.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-hero-red to-red-500 hover:from-hero-red/90 hover:to-red-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      "Mettre à jour le profil"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle>Informations médicales</CardTitle>
              <CardDescription>
                Ces informations sont utilisées pour déterminer votre éligibilité au don de sang et pour vous montrer
                des demandes compatibles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groupe sanguin</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Sélectionnez votre groupe sanguin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bloodTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastDonation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date du dernier don</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="h-11" />
                        </FormControl>
                        <FormDescription>
                          Cette information est utilisée pour calculer votre prochaine date d'éligibilité.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poids (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-11" />
                        </FormControl>
                        <FormDescription>
                          Vous devez peser au moins 50 kg pour être éligible au don de sang.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chronicConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conditions médicales chroniques</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: diabète, hypertension, etc." className="h-11" />
                        </FormControl>
                        <FormDescription>
                          Certaines conditions médicales peuvent affecter votre éligibilité au don de sang.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-yellow-800">
                        <p className="font-medium">Important</p>
                        <p className="text-sm">
                          Certaines informations médicales ne peuvent être modifiées que par le personnel médical lors
                          de votre prochain don. Si vous avez des questions concernant votre éligibilité au don,
                          veuillez contacter votre centre de don de sang.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-hero-red to-red-500 hover:from-hero-red/90 hover:to-red-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      "Mettre à jour les informations médicales"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
