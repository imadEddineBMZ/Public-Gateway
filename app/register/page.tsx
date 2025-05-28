"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function RegisterPage() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    bloodType: "",
    wilaya: "",
    lastDonation: "",
    weight: "",
    chronicConditions: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      setIsLoading(false)
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        bloodType: formData.bloodType,
        wilaya: formData.wilaya,
        lastDonation: formData.lastDonation || null,
      })
    } catch (err) {
      setError("L'inscription a échoué. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Veuillez remplir tous les champs obligatoires.")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.")
        return
      }
    }
    setError("")
    setStep(step + 1)
  }

  const prevStep = () => {
    setError("")
    setStep(step - 1)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white to-red-50">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-trust-blue hover:text-hero-red transition-colors">
          <div className="w-8 h-8 bg-hero-red rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-white"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="font-bold">DonorConnect</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-trust-blue">Inscription</CardTitle>
            <CardDescription>Créez un compte pour commencer à donner du sang</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <div className="text-sm font-medium">Étape {step} sur 2</div>
                <div className="text-sm text-gray-500">
                  {step === 1 ? "Informations de base" : "Informations de donneur"}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-hero-red h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 2) * 100}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-11"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-11"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Groupe sanguin</Label>
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) => handleSelectChange("bloodType", value)}
                      required
                    >
                      <SelectTrigger id="bloodType" className="h-11">
                        <SelectValue placeholder="Sélectionnez votre groupe sanguin" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wilaya">Wilaya</Label>
                    <Select
                      value={formData.wilaya}
                      onValueChange={(value) => handleSelectChange("wilaya", value)}
                      required
                    >
                      <SelectTrigger id="wilaya" className="h-11">
                        <SelectValue placeholder="Sélectionnez votre wilaya" />
                      </SelectTrigger>
                      <SelectContent>
                        {wilayas.map((wilaya) => (
                          <SelectItem key={wilaya} value={wilaya}>
                            {wilaya}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastDonation">Date du dernier don (optionnel)</Label>
                    <Input
                      id="lastDonation"
                      type="date"
                      value={formData.lastDonation}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Poids (kg) (optionnel)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      className="h-11"
                      placeholder="Votre poids en kg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chronicConditions">Conditions médicales chroniques (optionnel)</Label>
                    <Input
                      id="chronicConditions"
                      value={formData.chronicConditions}
                      onChange={handleChange}
                      className="h-11"
                      placeholder="Ex: diabète, hypertension, etc."
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="h-11">
                    Précédent
                  </Button>
                )}
                {step < 2 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="h-11 bg-hero-red hover:bg-hero-red/90 text-white ml-auto"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="h-11 bg-hero-red hover:bg-hero-red/90 text-white ml-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      "S'inscrire"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Vous avez déjà un compte?{" "}
              <Link href="/login" className="text-hero-red hover:underline">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
