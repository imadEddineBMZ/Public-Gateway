"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { AlertTriangle, Clock, MapPin, Share2, Heart, UserPlus, Droplet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AuthRequiredDialog } from "@/components/auth-required-dialog"

// Blood Group Mapping
const BLOOD_GROUP_MAP = {
  1: "AB+",
  2: "AB-",
  3: "A+", 
  4: "A-",
  5: "B+",
  6: "B-",
  7: "O+",
  8: "O-"
}

// Priority Mapping
const PRIORITY_MAP = {
  1: "low",
  2: "standard", 
  3: "critical"
}

// Donation Type Mapping
const DONATION_TYPE_MAP = {
  1: "Sang total",
  2: "Plaquettes",
  3: "Plasma"
}

// Types pour les demandes de sang
type RequestUrgency = "critical" | "urgent" | "standard" | "low"

type BloodRequest = {
  id: string
  hospitalName: string
  bloodType: string
  bloodGroup: number
  donationType: number
  priority: number
  urgency: RequestUrgency
  deadline: string
  location: string
  distance: number
  notes: string
  unitsNeeded: number
}

interface BloodRequestCardProps {
  request: BloodRequest
}

export function BloodRequestCard({ request }: BloodRequestCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isInterested, setIsInterested] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  // Get blood type from numeric code
  const bloodGroupText = BLOOD_GROUP_MAP[request.bloodGroup as keyof typeof BLOOD_GROUP_MAP] || request.bloodType;
  
  // Get donation type text
  const donationTypeText = DONATION_TYPE_MAP[request.donationType as keyof typeof DONATION_TYPE_MAP] || "Sang";
  
  // Get priority/urgency from numeric code
  const priorityCode = request.priority || 2; // Default to standard if missing
  const urgencyValue = PRIORITY_MAP[priorityCode as keyof typeof PRIORITY_MAP] || "standard";

  // Fonction pour obtenir la couleur du badge en fonction de l'urgence
  const getUrgencyBadgeVariant = (urgency: RequestUrgency) => {
    switch (urgency) {
      case "critical":
        return "destructive"
      case "urgent":
      case "standard":
        return "default"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  // Fonction pour obtenir le texte de l'urgence en français
  const getUrgencyText = (urgency: RequestUrgency) => {
    switch (urgency) {
      case "critical":
        return "Critique"
      case "urgent":
        return "Urgent"
      case "standard":
        return "Standard"
      case "low":
        return "Non urgent"
      default:
        return urgency
    }
  }

  const handleInterested = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez vous connecter pour marquer votre intérêt.",
        className: "bg-gradient-to-r from-blue-50 to-white border-l-4 border-trust-blue",
      })
      return
    }

    setIsInterested(true)
    toast({
      title: "Intérêt enregistré",
      description: "Vous recevrez des notifications sur cette demande de sang.",
      className: "bg-gradient-to-r from-red-50 to-white border-l-4 border-hero-red",
    })
  }

  const handlePledge = () => {
    if (!user) {
      // Show the auth required dialog instead of just a toast
      setShowAuthDialog(true);
      return;
    }
    
    router.push(`/dashboard/pledges/new?requestId=${request.id}`)
  }

  const handleShare = () => {
    // Simuler le partage
    const shareUrl = `${window.location.origin}/request/${request.id}`
    const shareText = `Aidez à sauver une vie à ${request.location} - Besoin urgent de sang ${bloodGroupText}!`

    if (navigator.share) {
      navigator.share({
        title: "DonorConnect - Demande de sang",
        text: shareText,
        url: shareUrl,
      })
    } else {
      // Copier le lien dans le presse-papier
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans votre presse-papier.",
        className: "bg-gradient-to-r from-blue-50 to-white border-l-4 border-trust-blue",
      })
    }
  }

  const headerClassName = cn(
    urgencyValue === "critical"
      ? "bg-gradient-to-r from-alert-coral to-red-400 text-white"
      : urgencyValue === "standard"
        ? "bg-gradient-to-r from-hero-red to-red-500 text-white"
        : "bg-gradient-to-r from-gray-100 to-gray-50",
  )

  const badgeClassName = cn(
    urgencyValue === "critical" || urgencyValue === "standard" ? "bg-white/20 text-white border-white/30" : "",
  )

  const buttonClassName = cn(
    "flex-1",
    isInterested
      ? "border-hero-red text-hero-red hover:bg-red-50 gap-1"
      : "bg-hero-red hover:bg-hero-red/90 text-white gap-1",
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className={headerClassName}>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{request.hospitalName}</CardTitle>
            <Badge
              variant={
                urgencyValue === "critical" || urgencyValue === "standard"
                  ? "outline"
                  : getUrgencyBadgeVariant(urgencyValue as RequestUrgency)
              }
              className={badgeClassName}
            >
              {getUrgencyText(urgencyValue as RequestUrgency)}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {request.location} ({request.distance} km)
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center text-hero-red font-bold text-lg shadow-sm">
              {bloodGroupText}
            </div>
            <div>
              
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Date limite:</span>
              </div>
              <div className="font-medium">{new Date(request.deadline).toLocaleDateString("fr-FR")}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-500">Type de don</div>
              <div className="font-medium flex items-center justify-end gap-1">
                <Droplet className="h-3.5 w-3.5" />
                {donationTypeText}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">{request.notes}</p>

          <div className="flex items-center gap-2 text-sm">
            {urgencyValue === "critical" && (
              <div className="flex items-center gap-1 text-alert-coral animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                <span>Besoin critique</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 p-4 pt-0 mt-auto">
          <Button
            variant={isInterested ? "outline" : "default"}
            size="sm"
            className={buttonClassName}
            onClick={handleInterested}
            disabled={isInterested}
          >
            <Heart className={cn("h-4 w-4", isInterested ? "fill-hero-red" : "")} />
            {isInterested ? "Intéressé" : "Je suis intéressé"}
          </Button>

          {user ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  S'engager
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>S'engager à donner du sang</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vous ne pouvez vous engager que pour une seule demande à la fois. Êtes-vous sûr de vouloir vous
                    engager pour cette demande de sang à {request.hospitalName}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePledge} className="bg-hero-red hover:bg-hero-red/90">
                    Confirmer l'engagement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Link href="/register" className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1 border-trust-blue text-trust-blue hover:bg-blue-50"
              >
                <UserPlus className="h-4 w-4" />
                S'inscrire pour s'engager
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" onClick={handleShare} className="hover:bg-blue-50 hover:text-trust-blue">
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Auth Required Dialog */}
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title="Connexion requise"
        description="Vous devez être connecté pour vous engager à donner du sang. Connectez-vous ou créez un compte pour continuer."
        action="pledge"
      />
    </motion.div>
  )
}
