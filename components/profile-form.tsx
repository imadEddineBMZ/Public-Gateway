"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Upload, Camera, User, Mail, Phone, MapPin, FileText, Shield } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"

// Schéma de validation pour le formulaire
const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit comporter au moins 2 caractères.",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit comporter au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phone: z.string().min(10, {
    message: "Le numéro de téléphone doit comporter au moins 10 chiffres.",
  }),
  address: z.string().min(5, {
    message: "L'adresse doit comporter au moins 5 caractères.",
  }),
  city: z.string().min(2, {
    message: "La ville doit comporter au moins 2 caractères.",
  }),
  postalCode: z.string().min(5, {
    message: "Le code postal doit comporter au moins 5 caractères.",
  }),
  bio: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)

  // Données simulées du profil
  const defaultValues: Partial<ProfileFormValues> = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    phone: "0612345678",
    address: "123 Rue de la Paix",
    city: "Paris",
    postalCode: "75001",
    bio: "Donneur régulier depuis 2020.",
  }

  // Informations médicales non modifiables
  const medicalInfo = {
    bloodType: "O+",
    nin: "1234567890123",
    height: 175,
    weight: 70,
    allergies: "Aucune",
    medications: "Aucun",
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
      console.log(data)
      // Afficher une notification de succès
    }, 1500)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-xl">
          <TabsTrigger
            value="personal"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all duration-200"
          >
            Informations personnelles
          </TabsTrigger>
          <TabsTrigger
            value="medical"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all duration-200"
          >
            Informations médicales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles. Ces informations seront affichées publiquement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xl">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <h3 className="text-lg font-medium">Jean Dupont</h3>
                    <Badge variant="outline" className="w-fit bg-purple-100 text-purple-800 border-purple-200">
                      Donneur régulier
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Membre depuis {new Date("2020-01-01").toLocaleDateString("fr-FR")}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
                    >
                      <Upload className="h-4 w-4" />
                      Changer la photo
                    </Button>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-500" />
                            Prénom
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11 px-4 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-500" />
                            Nom
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11 px-4 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-purple-500" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11 px-4 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                            />
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
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-purple-500" />
                            Téléphone
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11 px-4 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          Adresse
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 px-4 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-purple-500" />
                            Ville
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11 px-4 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-purple-500" />
                            Code postal
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11 px-4 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-500" />
                          Bio
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Parlez-nous un peu de vous..."
                            className="resize-none min-h-[100px] bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Vous pouvez mentionner pourquoi vous donnez du sang.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-200"
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
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle>Informations médicales</CardTitle>
              <CardDescription>
                Ces informations sont utilisées pour déterminer votre éligibilité au don de sang. Certaines informations
                ne peuvent être modifiées que par le personnel médical.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="bloodType" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Groupe sanguin
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="bloodType"
                      value={medicalInfo.bloodType}
                      readOnly
                      className="h-11 bg-gray-50 border-gray-200"
                    />
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                      Vérifié
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="nin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Numéro d'identification national
                  </Label>
                  <Input id="nin" value={medicalInfo.nin} readOnly className="h-11 bg-gray-50 border-gray-200 mt-2" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="height" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Taille (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={medicalInfo.height}
                    className="h-11 mt-2 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Poids (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={medicalInfo.weight}
                    className="h-11 mt-2 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="allergies" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  Allergies
                </Label>
                <Select defaultValue={medicalInfo.allergies === "Aucune" ? "none" : "has"}>
                  <SelectTrigger
                    id="allergies"
                    className="h-11 mt-2 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                  >
                    <SelectValue placeholder="Sélectionnez une option" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-100 shadow-lg">
                    <SelectItem value="none">Aucune allergie</SelectItem>
                    <SelectItem value="has">J'ai des allergies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="medications" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  Médicaments actuels
                </Label>
                <Select defaultValue={medicalInfo.medications === "Aucun" ? "none" : "has"}>
                  <SelectTrigger
                    id="medications"
                    className="h-11 mt-2 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                  >
                    <SelectValue placeholder="Sélectionnez une option" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-100 shadow-lg">
                    <SelectItem value="none">Aucun médicament</SelectItem>
                    <SelectItem value="has">Je prends des médicaments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <motion.div
                className="rounded-md border border-yellow-200 bg-yellow-50 p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-yellow-800">
                    <p className="font-medium">Important</p>
                    <p className="text-sm">
                      Certaines informations médicales ne peuvent être modifiées que par le personnel médical lors de
                      votre prochain don. Si vous avez des questions concernant votre éligibilité au don, veuillez
                      contacter votre centre de don de sang.
                    </p>
                  </div>
                </div>
              </motion.div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-200">
                Mettre à jour les informations médicales
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
