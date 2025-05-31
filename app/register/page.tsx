"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Heart, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { getWilayas, getCommunes, WILAYA_MAP } from "@/services/api/locations/locations-service"
import type { WilayaDTO, CommuneDTO } from "@/client/models"

export default function RegisterPage() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    // Basic auth info
    email: "",
    password: "",
    confirmPassword: "",
    
    // Donor personal info
    donorName: "",
    donorBirthDate: "",
    donorNIN: "",
    donorTel: "",
    
    // Medical info
    donorBloodGroup: 0,
    donorLastDonationDate: "",
    
    // Settings and preferences
    donorWantToStayAnonymous: false,
    donorExcludeFromPublicPortal: false,
    donorAvailability: 1,
    donorContactMethod: 1,
    
    // Additional info
    donorNotesForBTC: "",
    communeId: 0,
    wilayaId: 0, // Added wilayaId to track the selected wilaya
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  
  // Add state for wilayas and communes
  const [wilayas, setWilayas] = useState<WilayaDTO[]>([])
  const [communes, setCommunes] = useState<CommuneDTO[]>([])
  const [loadingCommunes, setLoadingCommunes] = useState(false)
  const [loadingWilayas, setLoadingWilayas] = useState(true)

  // Blood group mapping to match API values
  const bloodGroupMap = {
    "AB+": 1,
    "AB-": 2,
    "A+": 3,
    "A-": 4,
    "B+": 5,
    "B-": 6,
    "O+": 7,
    "O-": 8
  }
  
  // Available blood types for selection
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  
  // Load wilayas when component mounts
  useEffect(() => {
    async function loadWilayas() {
      setLoadingWilayas(true);
      try {
        // Directly fetch wilayas instead of using the service if there's an issue
        let wilayasData = await getWilayas();
        
        // If the service returns an empty array, use the static data as fallback
        if (!wilayasData || wilayasData.length === 0) {
          console.log('[REGISTER] Using fallback wilayas data');
          
          // Create wilayas from the WILAYA_MAP in locations-service.ts
          wilayasData = Object.entries(WILAYA_MAP).map(([id, name]) => ({
            id: parseInt(id),
            name: name
          }));
        }
        
        console.log('[REGISTER] Loaded wilayas:', wilayasData);
        setWilayas(wilayasData);
      } catch (error) {
        console.error('[REGISTER] Error loading wilayas:', error);
        
        // Even on error, use the static data as fallback
        const fallbackWilayas = Object.entries(WILAYA_MAP).map(([id, name]) => ({
          id: parseInt(id),
          name: name
        }));
        
        setWilayas(fallbackWilayas);
      } finally {
        setLoadingWilayas(false);
      }
    }
    
    loadWilayas()
  }, [])
  
  // Load communes when wilaya changes
  useEffect(() => {
    async function loadCommunes() {
      if (!formData.wilayaId) {
        setCommunes([])
        return
      }
      
      setLoadingCommunes(true)
      try {
        console.log(`[REGISTER] Loading communes for wilaya ID: ${formData.wilayaId}`)
        const communesData = await getCommunes(formData.wilayaId)
        console.log('[REGISTER] Loaded communes:', communesData)
        setCommunes(communesData)
      } catch (error) {
        console.error(`[REGISTER] Error loading communes for wilaya ${formData.wilayaId}:`, error)
        setCommunes([])
      } finally {
        setLoadingCommunes(false)
      }
    }
    
    loadCommunes()
  }, [formData.wilayaId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validations
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }
    

    // Enhanced password validation
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setIsLoading(false);
      return;
    }
    
    // Check for uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      setError("Le mot de passe doit contenir au moins une lettre majuscule.");
      setIsLoading(false);
      return;
    }
    
    // Check for non-alphanumeric character
    if (!/[^a-zA-Z0-9]/.test(formData.password)) {
      setError("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...).");
      setIsLoading(false);
      return;
    }
    
    // Check all required fields
    const requiredFields = [
      { field: 'email', message: 'L\'email est requis' },
      { field: 'password', message: 'Le mot de passe est requis' },
      { field: 'donorName', message: 'Le nom est requis' },
      { field: 'donorBirthDate', message: 'La date de naissance est requise' },
      { field: 'donorNIN', message: 'Le numéro d\'identité nationale est requis' },
      { field: 'donorTel', message: 'Le numéro de téléphone est requis' },
      { field: 'donorBloodGroup', message: 'Le groupe sanguin est requis', check: (val: any) => val > 0 },
      { field: 'communeId', message: 'La commune est requise', check: (val: any) => val > 0 }
    ];
    
    for (const item of requiredFields) {
      const value = formData[item.field as keyof typeof formData];
      const isValid = item.check ? item.check(value) : !!value;
      
      if (!isValid) {
        setError(item.message);
        setIsLoading(false);
        return;
      }
    }
    
    // Add these format validations before submitting
    const ninPattern = /^\d{15,18}$/;  // Adjust based on NIN format in Algeria
    if (!ninPattern.test(formData.donorNIN)) {
      setError("Le numéro d'identité doit contenir entre 15 et 18 chiffres.");
      setIsLoading(false);
      return;
    }

    const phonePattern = /^0[567]\d{8}$/;  // Algerian phone numbers
    if (!phonePattern.test(formData.donorTel)) {
      setError("Le format du numéro de téléphone n'est pas valide (ex: 05XXXXXXXX).");
      setIsLoading(false);
      return;
    }
    
    try {
      // Properly format dates for the API
      const registrationData = {
        // Auth data
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        
        // Donor personal info
        donorName: formData.donorName,
        donorBirthDate: formData.donorBirthDate ? new Date(formData.donorBirthDate) : undefined,
        donorNIN: formData.donorNIN,
        donorTel: formData.donorTel,
        
        // Medical info
        donorBloodGroup: formData.donorBloodGroup,
        donorLastDonationDate: formData.donorLastDonationDate ? new Date(formData.donorLastDonationDate) : undefined,
        
        // Settings and preferences
        donorWantToStayAnonymous: formData.donorWantToStayAnonymous,
        donorExcludeFromPublicPortal: formData.donorExcludeFromPublicPortal,
        donorAvailability: formData.donorAvailability,
        donorContactMethod: formData.donorContactMethod,
        
        // Additional info
        donorNotesForBTC: formData.donorNotesForBTC,
        communeId: formData.communeId,
        wilayaId: formData.wilayaId, // Include wilayaId
        
        // Generate correlation ID
       // donorCorrelationId: `${formData.email.split('@')[0]}-${Date.now()}`,
      };
      
      console.log("[REGISTER] Submitting registration data:", registrationData);
      
      // Use fetch directly instead of the Kiota client
      const response = await fetch("https://localhost:57679/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(registrationData)
      });
      
      // First check the response status
      if (!response.ok) {
        // Check if there's a response body to parse
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorText = await response.text();
          if (errorText && errorText.trim() !== "") {
            const errorData = JSON.parse(errorText);
            throw errorData;
          } else {
            // Empty JSON response
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        } else {
          // Not a JSON response
          const errorText = await response.text();
          throw new Error(errorText || `Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Check if there's any content before trying to parse JSON
      const contentLength = response.headers.get('content-length');
      const hasContent = contentLength !== '0' && contentLength !== null;
      
      let responseData = null;
      if (hasContent) {
        const responseText = await response.text();
        if (responseText && responseText.trim() !== "") {
          responseData = JSON.parse(responseText);
          console.log("[REGISTER] Registration successful with data:", responseData);
        } else {
          console.log("[REGISTER] Registration successful (empty response)");
        }
      } else {
        console.log("[REGISTER] Registration successful (no content)");
      }
      
      // Handle successful registration
      window.location.href = '/login';
    } catch (error:any) {
      console.error("Registration error:", error);
      
      // Extract specific error message if available
      let errorMessage = "Une erreur s'est produite lors de l'inscription.";
      
      if (error instanceof SyntaxError) {
        console.error("JSON parsing error:", error);
        errorMessage = "Erreur de communication avec le serveur.";
      } else if (error.errors && Array.isArray(error.errors)) {
        // Display only the first error message for clarity
        if (error.errors.length > 0) {
          const firstError = error.errors[0];
          errorMessage = firstError.reason || firstError.message || firstError.description || firstError;
          
          // Log all errors for debugging
          console.error("All validation errors:", JSON.stringify(error.errors, null, 2));
        }
      } else if (error.detail) {
        errorMessage = error.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const nextStep = () => {
    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="flex flex-col items-center justify-center w-full py-12 px-4">
        <Link href="/" className="flex items-center gap-2 text-red-600 mb-8">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="font-bold">DonorConnect</span>
        </Link>

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
                  <div className="text-sm font-medium">Étape {step} sur 3</div>
                  <div className="text-sm text-gray-500">
                    {step === 1 ? "Informations de base" : step === 2 ? "Informations médicales" : "Préférences"}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-trust-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-11"
                        required
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
                        className="h-11"
                        required
                        placeholder="********"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="h-11"
                        required
                        placeholder="********"
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="donorName">Nom complet</Label>
                      <Input
                        id="donorName"
                        value={formData.donorName}
                        onChange={handleChange}
                        className="h-11"
                        required
                        placeholder="Prénom Nom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donorBirthDate">Date de naissance</Label>
                      <Input
                        id="donorBirthDate"
                        type="date"
                        value={formData.donorBirthDate}
                        onChange={handleChange}
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donorNIN">Numéro d'identité nationale (NIN)</Label>
                      <Input
                        id="donorNIN"
                        value={formData.donorNIN}
                        onChange={handleChange}
                        className="h-11"
                        required
                        placeholder="Votre numéro d'identité"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donorTel">Numéro de téléphone</Label>
                      <Input
                        id="donorTel"
                        type="tel"
                        value={formData.donorTel}
                        onChange={handleChange}
                        className="h-11"
                        required
                        placeholder="07XXXXXXXX"
                      />
                    </div>
                    
                    {/* Added Wilaya selection field */}
                    <div className="space-y-2">
                      <Label htmlFor="wilayaId">Wilaya</Label>
                      <Select 
                        value={formData.wilayaId > 0 ? formData.wilayaId.toString() : ''} 
                        onValueChange={(value) => handleSelectChange("wilayaId", parseInt(value))}
                        disabled={loadingWilayas}
                      >
                        <SelectTrigger id="wilayaId" className="h-11">
                          <SelectValue placeholder={loadingWilayas ? "Chargement des wilayas..." : "Sélectionner une wilaya"} />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.id} value={wilaya.id?.toString() || ""}>
                              {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Updated Commune selection field */}
                    <div className="space-y-2">
                      <Label htmlFor="communeId">Commune</Label>
                      <Select 
                        value={formData.communeId > 0 ? formData.communeId.toString() : ''} 
                        onValueChange={(value) => handleSelectChange("communeId", parseInt(value))}
                        disabled={!formData.wilayaId || loadingCommunes}
                      >
                        <SelectTrigger id="communeId" className="h-11">
                          <SelectValue placeholder={
                            !formData.wilayaId 
                              ? "Sélectionnez d'abord une wilaya" 
                              : loadingCommunes 
                                ? "Chargement des communes..." 
                                : "Sélectionner une commune"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingCommunes ? (
                            <div className="flex items-center justify-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Chargement...</span>
                            </div>
                          ) : communes.length > 0 ? (
                            communes.map((commune) => (
                              <SelectItem key={commune.id} value={commune.id?.toString() || ""}>
                                {commune.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="text-center py-2 text-sm text-gray-500">
                              {formData.wilayaId ? "Aucune commune trouvée" : "Veuillez d'abord sélectionner une wilaya"}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="donorBloodGroup">Groupe sanguin</Label>
                      <Select 
                        value={formData.donorBloodGroup > 0 ? formData.donorBloodGroup.toString() : ''} 
                        onValueChange={(value) => handleSelectChange("donorBloodGroup", parseInt(value))}
                      >
                        <SelectTrigger id="donorBloodGroup" className="h-11">
                          <SelectValue placeholder="Sélectionner votre groupe sanguin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">AB+</SelectItem>
                          <SelectItem value="2">AB-</SelectItem>
                          <SelectItem value="3">A+</SelectItem>
                          <SelectItem value="4">A-</SelectItem>
                          <SelectItem value="5">B+</SelectItem>
                          <SelectItem value="6">B-</SelectItem>
                          <SelectItem value="7">O+</SelectItem>
                          <SelectItem value="8">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donorLastDonationDate">Date du dernier don (si applicable)</Label>
                      <Input
                        id="donorLastDonationDate"
                        type="date"
                        value={formData.donorLastDonationDate}
                        onChange={handleChange}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Disponibilité pour don</Label>
                      <RadioGroup 
                        value={formData.donorAvailability.toString()} 
                        onValueChange={(value) => handleSelectChange("donorAvailability", parseInt(value))}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="available" />
                          <Label htmlFor="available" className="font-normal">Disponible - Je peux donner du sang maintenant</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="unavailable" />
                          <Label htmlFor="unavailable" className="font-normal">Indisponible - Je ne peux pas donner pour le moment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id="uncertain" />
                          <Label htmlFor="uncertain" className="font-normal">Incertain - Je ne suis pas sûr(e) de mon éligibilité</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="donorNotesForBTC">Notes médicales (optionnel)</Label>
                      <Textarea
                        id="donorNotesForBTC"
                        value={formData.donorNotesForBTC}
                        onChange={handleChange}
                        className="min-h-[100px]"
                        placeholder="Conditions médicales, allergies ou autres informations pertinentes pour le centre de transfusion"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Méthode de contact préférée</Label>
                      <RadioGroup 
                        value={formData.donorContactMethod.toString()} 
                        onValueChange={(value) => handleSelectChange("donorContactMethod", parseInt(value))}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="phone" />
                          <Label htmlFor="phone" className="font-normal">Appel téléphonique</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="sms" />
                          <Label htmlFor="sms" className="font-normal">SMS</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id="both" />
                          <Label htmlFor="both" className="font-normal">Les deux</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox 
                        id="donorWantToStayAnonymous" 
                        checked={formData.donorWantToStayAnonymous}
                        onCheckedChange={(checked) => handleCheckboxChange("donorWantToStayAnonymous", checked as boolean)} 
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="donorWantToStayAnonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Rester anonyme
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Votre nom ne sera pas visible publiquement
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox 
                        id="donorExcludeFromPublicPortal" 
                        checked={formData.donorExcludeFromPublicPortal}
                        onCheckedChange={(checked) => handleCheckboxChange("donorExcludeFromPublicPortal", checked as boolean)} 
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="donorExcludeFromPublicPortal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Exclure du portail public
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Votre profil ne sera pas visible dans la liste des donneurs
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        En terminant votre inscription, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <div className="flex w-full justify-between">
                {step > 1 && (
                  <Button variant="outline" onClick={prevStep} disabled={isLoading}>
                    Retour
                  </Button>
                )}
                {step < 3 ? (
                  <Button 
                    className="ml-auto" 
                    onClick={nextStep}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button 
                    className="ml-auto bg-hero-red hover:bg-red-700" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? "Inscription en cours..." : "S'inscrire"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Déjà inscrit?{" "}
          <Link href="/login" className="font-medium text-hero-red hover:text-red-700">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
