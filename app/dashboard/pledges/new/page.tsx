"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { createPledge } from "@/services/api-service"

export default function NewPledgePage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestDetails, setRequestDetails] = useState<any>(null)
  
  // Get the request ID from the URL query parameters
  const requestId = searchParams?.get('requestId')
  
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (!requestId) {
      toast({
        title: "Erreur",
        description: "Identifiant de demande manquant. Veuillez sélectionner une demande de sang.",
        variant: "destructive",
      })
      router.push('/requests')
      return
    }
    
    // Fetch request details (optional, if you want to show more details)
    // const fetchRequestDetails = async () => {
    //   setIsLoading(true)
    //   try {
    //     // Implement this API method if needed
    //     const details = await getBloodRequestDetails(requestId)
    //     setRequestDetails(details)
    //   } catch (error) {
    //     console.error("Error fetching request details:", error)
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }
    
    // fetchRequestDetails()
  }, [user, requestId, router, toast])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.token || !requestId) return
    
    setIsSubmitting(true)
    try {
      await createPledge(user.token, requestId, notes)
      
      toast({
        title: "Engagement créé avec succès",
        description: "Merci pour votre engagement à donner du sang. Vous serez contacté par l'hôpital.",
        className: "bg-gradient-to-r from-green-50 to-white border-l-4 border-life-green",
      })
      
      router.push('/dashboard/pledges?new=true')
    } catch (error) {
      console.error("Error creating pledge:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'engagement. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="outline" 
        onClick={() => router.back()} 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Nouvel engagement de don</CardTitle>
          <CardDescription>
            Engagez-vous à donner du sang pour aider à sauver des vies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-hero-red" />
              <span className="ml-2">Chargement des détails...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">Information importante</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      En vous engageant à donner du sang, vous acceptez d'être contacté par le centre de transfusion pour planifier votre don.
                      Veuillez respecter votre engagement ou l'annuler à l'avance si vous ne pouvez pas y donner suite.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes supplémentaires (optionnel)
                </label>
                <Textarea
                  id="notes"
                  placeholder="Ajoutez des informations complémentaires pour le centre de transfusion..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Par exemple: vos disponibilités, questions, ou conditions médicales pertinentes.
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-hero-red hover:bg-hero-red/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer mon engagement
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}