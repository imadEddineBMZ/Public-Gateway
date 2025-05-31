"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"

interface AuthRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  action: "pledge" | "subscribe"
}

export function AuthRequiredDialog({
  open,
  onOpenChange,
  title,
  description,
  action
}: AuthRequiredDialogProps) {
  const router = useRouter()

  const handleLogin = () => {
    router.push(`/login?redirect=${action === "pledge" ? "/requests" : "/hospitals"}`)
  }

  const handleRegister = () => {
    router.push("/register")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button 
            onClick={handleLogin}
            className="bg-trust-blue hover:bg-trust-blue/90 flex gap-2 items-center"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </Button>
          <Button 
            onClick={handleRegister}
            className="bg-hero-red hover:bg-hero-red/90 flex gap-2 items-center"
          >
            <UserPlus className="h-4 w-4" />
            S'inscrire
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}