"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin } from "lucide-react"
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
import { motion } from "framer-motion"

export function UpcomingAppointment() {
  const [hasAppointment, setHasAppointment] = useState(true)

  // Simulation d'un rendez-vous
  const appointment = {
    date: "2024-05-25",
    time: "10:00",
    location: "Centre de don de sang, Hôpital Central",
    address: "123 Avenue Principale, Ville",
  }

  const handleCancelAppointment = () => {
    setHasAppointment(false)
  }

  if (!hasAppointment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
          <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50">
            <CardTitle>Prochain rendez-vous</CardTitle>
            <CardDescription>Aucun rendez-vous prévu</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 text-center flex flex-col items-center justify-center h-[calc(100%-8rem)]">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-6">Vous n'avez pas de rendez-vous programmé</p>
            <Button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-md hover:shadow-lg transition-all duration-200">
              Prendre rendez-vous
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-400 text-white">
          <CardTitle>Prochain rendez-vous</CardTitle>
          <CardDescription className="text-blue-100">Votre prochain don de sang</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5 bg-white">
          <motion.div
            className="flex items-start gap-4 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-sm text-gray-500">
                {new Date(appointment.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </motion.div>
          <motion.div
            className="flex items-start gap-4 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Heure</p>
              <p className="text-sm text-gray-500">{appointment.time}</p>
            </div>
          </motion.div>
          <motion.div
            className="flex items-start gap-4 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">{appointment.location}</p>
              <p className="text-sm text-gray-500">{appointment.address}</p>
            </div>
          </motion.div>
        </CardContent>
        <CardFooter className="bg-white p-6 pt-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 transition-all duration-200"
              >
                Annuler le rendez-vous
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-none shadow-lg rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action ne peut pas être annulée. Cela annulera votre rendez-vous de don de sang prévu.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelAppointment}
                  className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-lg"
                >
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
