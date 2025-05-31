"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { getCommunes, getWilayas, WILAYA_MAP } from "@/services/api/locations/locations-service"
import type { CommuneDTO, WilayaDTO, UpdateUserDTO } from "@/client/models"
import { Label } from "@/components/ui/label"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

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
  wilaya: z.string().optional(),
  commune: z.string().optional(),
  lastDonation: z.string().optional(),
  chronicConditions: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingWilayas, setLoadingWilayas] = useState(false)
  const [communes, setCommunes] = useState<CommuneDTO[]>([])
  const [loadingCommunes, setLoadingCommunes] = useState(false)
  const [wilayasList, setWilayasList] = useState<WilayaDTO[]>([])
  const [userCommune, setUserCommune] = useState<CommuneDTO | null>(null)
  const [selectedWilayaId, setSelectedWilayaId] = useState<number | undefined>(user?.wilayaId)

  // Données du profil
  const defaultValues: Partial<ProfileFormValues> = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.donorTel || "",
    bloodType: user?.bloodType || "",
    wilaya: user?.wilayaId?.toString() || "",
    commune: user?.communeId?.toString() || "",
    lastDonation: user?.donorBirthDate ? 
      new Date(user.donorBirthDate).toISOString().split('T')[0] : "",
    chronicConditions: user?.donorNotesForBTC || ""
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.donorTel || "",
        bloodType: user.bloodType || "",
        wilaya: user.wilayaId?.toString() || "",
        commune: user.communeId?.toString() || "",
        lastDonation: user.donorBirthDate ? 
          new Date(user.donorBirthDate).toISOString().split('T')[0] : "",
        chronicConditions: user.donorNotesForBTC || ""
      });
      
      // If user has a wilaya, load communes for that wilaya
      if (user.wilaya) {
        const wilayaId = getWilayaIdFromName(user.wilaya);
        if (wilayaId) {
          getCommunes(wilayaId).then(communesData => {
            setCommunes(communesData);
          });
        }
      }
    }
  }, [user, form]);

  // Add this effect to load wilayas when component mounts
  useEffect(() => {
    async function loadWilayas() {
      setLoadingWilayas(true);
      try {
        const wilayasData = await getWilayas();
        setWilayasList(wilayasData);
      } catch (error) {
        console.error("Error loading wilayas:", error);
      } finally {
        setLoadingWilayas(false);
      }
    }
    
    loadWilayas();
  }, []);

  // Add this effect to load communes when wilaya changes
  useEffect(() => {
    async function loadCommunes() {
      const selectedWilaya = form.getValues().wilaya;
      if (!selectedWilaya) {
        setCommunes([]);
        return;
      }
      
      // Find wilaya ID from name
      const wilayaId = parseInt(selectedWilaya);
      if (!wilayaId) {
        setCommunes([]);
        return;
      }
      
      setLoadingCommunes(true);
      
      try {
        console.log(`Loading communes for wilaya ID: ${wilayaId}`);
        const communesData = await getCommunes(wilayaId);
        console.log("Loaded communes:", communesData);
        setCommunes(communesData);
      } catch (error) {
        console.error(`Error loading communes for wilaya ${wilayaId}:`, error);
        setCommunes([]);
      } finally {
        setLoadingCommunes(false);
      }
    }
    
    loadCommunes();
  }, [form.watch("wilaya")]);

  // Effect to load user's commune when component mounts
  useEffect(() => {
    // If user has a communeId, load their current commune
    if (user?.communeId) {
      const wilayaId = user.wilaya ? getWilayaIdFromName(user.wilaya) : null;
      
      if (wilayaId) {
        setLoadingCommunes(true);
        console.log(`[PROFILE] Loading communes for user's wilaya ID: ${wilayaId}`);
        
        // Load communes for the user's current wilaya
        getCommunes(wilayaId).then(communesData => {
          setCommunes(communesData);
          
          // Check if user's commune exists in the list
          const currentCommune = communesData.find(c => c.id === user.communeId);
          if (currentCommune) {
            console.log(`[PROFILE] Found user's commune: ${currentCommune.name} (ID: ${currentCommune.id})`);
            // Store the user's commune name in a separate state for reliability
            setUserCommune(currentCommune);
          } else {
            console.log(`[PROFILE] User's commune ID ${user.communeId} not found in communes list`);
            // Try to load the commune directly if not found in the list
            fetchCommuneById(user.communeId as number);
          }
          
          setLoadingCommunes(false);
        }).catch(error => {
          console.error(`[PROFILE] Error loading communes for user's wilaya:`, error);
          setLoadingCommunes(false);
          // Try to load the commune directly as a fallback
          fetchCommuneById(user.communeId as number);
        });
      } else {
        console.log(`[PROFILE] User has communeId ${user.communeId} but no wilaya or couldn't get wilayaId`);
        // Try to load the commune directly if we don't have a wilaya
        fetchCommuneById(user.communeId);
      }
    }
  }, [user]);

  // Update the onSubmit function to better handle profile updates

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    console.log("[PROFILE] Form submitted with data:", data);

    // Validate blood group before submission
    const bloodGroup = getBloodGroupNumber(data.bloodType);
    if (!bloodGroup && data.bloodType) {
      console.error(`[PROFILE] Invalid blood type: ${data.bloodType}`);
      toast({
        title: "Erreur",
        description: "Le groupe sanguin sélectionné est invalide.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate commune ID if present
    let communeId: number | undefined = undefined;
    let wilayaId: number | undefined = undefined;
    let wilayaName: string | undefined = undefined;
    
    // First check if wilaya is selected
    if (data.wilaya && data.wilaya.trim() !== "") {
      wilayaId = parseInt(data.wilaya);
      // Find the wilaya name from our list
      const selectedWilaya = wilayasList.find(w => w.id === wilayaId);
      wilayaName = selectedWilaya?.name || WILAYA_MAP[wilayaId as keyof typeof WILAYA_MAP] || "Unknown";
      console.log(`[PROFILE] Selected wilaya: ${wilayaName} (ID: ${wilayaId})`);
    }
    
    // Then check commune
    if (data.commune && data.commune.trim() !== "") {
      communeId = parseInt(data.commune);
      if (isNaN(communeId)) {
        toast({
          title: "Erreur",
          description: "ID de commune invalide.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Verify the commune belongs to the selected wilaya
      const commune = communes.find(c => c.id === communeId);
      if (!commune) {
        console.warn(`[PROFILE] Commune ID ${communeId} not found in current communes list`);
        // We'll continue anyway as it might be a valid ID not in our current list
      } else {
        console.log(`[PROFILE] Selected commune: ${commune.name} (ID: ${communeId}) for wilaya ID: ${commune.wilayaId}`);
        
        // If we have a commune but no wilaya, get the wilaya from the commune
        if (!wilayaId && commune.wilayaId) {
          wilayaId = commune.wilayaId;
          wilayaName = WILAYA_MAP[wilayaId as keyof typeof WILAYA_MAP] || "Unknown";
          console.log(`[PROFILE] Derived wilaya from commune: ${wilayaName} (ID: ${wilayaId})`);
        }
      }
    }

    // Create a copy of the current user data to update
    const updatedUserData = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Update with latest wilaya/commune info
    if (wilayaId) {
      updatedUserData.wilayaId = wilayaId;
      updatedUserData.wilaya = wilayaName;
    }
    
    if (communeId) {
      updatedUserData.communeId = communeId;
      // Update commune object if we have the full data
      const selectedCommune = communes.find(c => c.id === communeId);
      if (selectedCommune) {
        updatedUserData.commune = selectedCommune;
      }
    } else if (wilayaId) {
      // If wilaya changed but no commune selected, clear commune data
      updatedUserData.communeId = undefined;
      updatedUserData.commune = null;
    }

    // Create the request object with the exact keys that the API expects
    const profileUpdateData: Partial<UpdateUserDTO> = {
      donorWantToStayAnonymous: false,
      donorExcludeFromPublicPortal: false,
      donorAvailability: 1,
      donorContactMethod: 1,
      donorName: data.name,
      // Notice this is donorBirthDate but we're storing the last donation date
      donorBirthDate: data.lastDonation ? new Date(data.lastDonation) : undefined,
      donorBloodGroup: bloodGroup,
      donorTel: data.phone || "",
      donorNotesForBTC: data.chronicConditions || "",
      communeId: communeId
    };

    console.log("[PROFILE] Sending profile update:", profileUpdateData);
    
    try {
      // Call the update function with timeout to prevent hanging
      const success = await Promise.race([
        updateProfile(profileUpdateData),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error("Profile update timed out")), 10000)
        )
      ]);

      if (success) {
        // After successful update, get the current user data from localStorage
        const updatedUserData = JSON.parse(localStorage.getItem("user") || "{}");
        
        // Update with latest wilaya/commune info
        if (wilayaId) {
          updatedUserData.wilayaId = wilayaId;
          updatedUserData.wilaya = wilayaName;
        }
        
        if (communeId) {
          updatedUserData.communeId = communeId;
          // Update commune object if we have the full data
          const selectedCommune = communes.find(c => c.id === communeId);
          if (selectedCommune) {
            updatedUserData.commune = selectedCommune;
          }
        } else if (wilayaId) {
          // If wilaya changed but no commune selected, clear commune data
          updatedUserData.communeId = undefined;
          updatedUserData.commune = null;
        }
        
        // IMPORTANT: Update the last donation date in multiple fields for compatibility
        if (data.lastDonation) {
          // The API expects donorBirthDate but we're using it for last donation
          updatedUserData.donorBirthDate = data.lastDonation;
          
          // Add these additional fields for the donation-status component
          updatedUserData.donorLastDonationDate = data.lastDonation;
          updatedUserData.lastDonation = data.lastDonation;
        }
        
        // Save the updated user data to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUserData));
        window.dispatchEvent(new Event('storage')); // Trigger auth provider update
        
        // Show success toast
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès.",
          className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
        });
        
        // Rest of your success handling code...
      }
    } catch (error) {
      // Error handling...
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to convert blood type string to number
  function getBloodGroupNumber(bloodType: string): number | undefined {
    if (!bloodType) return undefined;
    
    const bloodGroupMap: Record<string, number> = {
      "AB+": 1, "AB-": 2, "A+": 3, "A-": 4,
      "B+": 5, "B-": 6, "O+": 7, "O-": 8
    };
    
    const result = bloodGroupMap[bloodType];
    console.log(`Converting blood type ${bloodType} to number: ${result}`);
    return result;
  }

  // Helper function to get wilaya ID from name
  function getWilayaIdFromName(wilayaName: string): number | undefined {
    for (const [id, name] of Object.entries(WILAYA_MAP)) {
      if (name === wilayaName) {
        return parseInt(id);
      }
    }
    return undefined;
  }

  // Improved helper function to get commune name from ID
  function getCommuneNameFromCurrentCommunesList(communeId: number): string {
    // First check if we have the user's specific commune loaded
    if (userCommune?.id === communeId && userCommune?.name) {
      return userCommune.name;
    }
    
    // Then try to find in the current communes list
    const commune = communes.find(c => c.id === communeId);
    if (commune?.name) {
      return commune.name;
    }
    
    // If not found and we know it's being loaded, show loading message
    if (loadingCommunes) {
      return "Chargement...";
    }
    
    // As a last resort, show a better fallback
    return "Commune non trouvée";
  }

  // Add this function to fetch a specific commune by ID
  async function fetchCommuneById(communeId: number) {
    try {
      // You might need to create a new API function for this
      // For now, we'll just set a placeholder name
      setUserCommune({
        id: communeId,
        name: `Commune ${communeId}`,
        wilayaId: 0
      } as CommuneDTO);
      
      console.log(`[PROFILE] Fetched commune by ID: ${communeId}`);
    } catch (error) {
      console.error(`[PROFILE] Error fetching commune by ID ${communeId}:`, error);
    }
  }

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U"

  // Handle wilaya selection change
  const handleWilayaChange = (wilayaId: string) => {
    const numericWilayaId = parseInt(wilayaId);
    console.log(`[PROFILE] Wilaya changed to ID: ${numericWilayaId}`);
    
    // Find the wilaya name from our list
    const selectedWilaya = wilayasList.find(w => w.id === numericWilayaId);
    const wilayaName = selectedWilaya?.name || WILAYA_MAP[numericWilayaId as keyof typeof WILAYA_MAP] || "Unknown";
    
    // Update local state
    setSelectedWilayaId(numericWilayaId);
    
    // Update the form value
    form.setValue("wilaya", wilayaId);
    
    // Clear commune selection when wilaya changes
    form.setValue("commune", undefined);
    
    // Update user data in localStorage
    if (numericWilayaId) {
      try {
        // Get current user data from localStorage
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        
        // Update wilaya information
        userData.wilayaId = numericWilayaId;
        userData.wilaya = wilayaName;
        
        // If we're changing wilaya, we should clear the commune info
        userData.communeId = undefined;
        userData.commune = null;
        
        // Save back to localStorage and trigger the storage event
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(new Event('storage')); // Trigger auth provider update
        
        console.log(`[PROFILE] Updated user's wilaya in localStorage: ${wilayaName} (ID: ${numericWilayaId})`);
      } catch (error) {
        console.error("[PROFILE] Error updating localStorage:", error);
      }
    }
    
    // Load communes for this wilaya
    if (numericWilayaId) {
      setLoadingCommunes(true);
      
      getCommunes(numericWilayaId)
        .then(communesData => {
          console.log(`[PROFILE] Loaded ${communesData.length} communes for wilaya ${numericWilayaId}`);
          setCommunes(communesData);
        })
        .catch(error => {
          console.error(`[PROFILE] Error loading communes for wilaya ${numericWilayaId}:`, error);
          setCommunes([]);
        })
        .finally(() => {
          setLoadingCommunes(false);
        });
    } else {
      setCommunes([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Mon Profil</h2>
          <p className="text-gray-500">Gérez vos informations personnelles et médicales</p>
        </div>
      </div>

      {/* Simplified UI - Single card with all profile information */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle>Informations personnelles et médicales</CardTitle>
          <CardDescription>
            Gérez toutes vos informations. Ces données seront partagées avec les hôpitaux lorsque vous vous engagez à donner du sang.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Avatar section */}
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
                {user && 'badges' in user && Array.isArray((user as any).badges) && (user as any).badges.length > 0 && (
                  <Badge variant="outline" className="w-fit bg-gold-badge/20 text-trust-blue border-gold-badge/30">
                    {(user as any).badges[0]}
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
              {/* Personal Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informations personnelles</h3>
                
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
                
                {/* Medical Info Section */}
                <h3 className="text-lg font-medium mt-6">Informations médicales</h3>
                
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

                {/* Wilaya and Commune fields */}
                <FormField
                  control={form.control}
                  name="wilaya"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wilaya</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={handleWilayaChange}
                        disabled={loadingWilayas}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={loadingWilayas ? "Chargement des wilayas..." : "Sélectionner une wilaya"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingWilayas ? (
                            <div className="flex items-center justify-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Chargement...</span>
                            </div>
                          ) : (
                            wilayasList.map((wilaya) => (
                              <SelectItem key={wilaya.id} value={wilaya.id?.toString() || ""}>
                                {wilaya.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="commune"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commune</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={!selectedWilayaId || loadingCommunes}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={
                              !selectedWilayaId 
                                ? "Sélectionnez d'abord une wilaya" 
                                : loadingCommunes 
                                  ? "Chargement des communes..." 
                                  : "Sélectionner une commune"
                            } />
                          </SelectTrigger>
                        </FormControl>
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
                            <div className="py-2 px-2 text-center text-muted-foreground">
                              Aucune commune disponible
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  "Mettre à jour le profil"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
