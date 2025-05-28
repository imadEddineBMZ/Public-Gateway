"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Bell, Menu, Heart, Building2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const [notificationCount, setNotificationCount] = useState(2)
  const [showNotifications, setShowNotifications] = useState(false)

  // Données simulées pour les notifications
  const notifications = [
    {
      id: 1,
      title: "Demande urgente",
      message: "Besoin urgent de sang O+ à l'hôpital Central d'Alger",
      time: "Il y a 1 heure",
      type: "urgent",
    },
    {
      id: 2,
      title: "Éligibilité au don",
      message: "Vous êtes maintenant éligible pour donner du sang",
      time: "Il y a 2 jours",
      type: "info",
    },
  ]

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    if (notificationCount > 0) {
      setNotificationCount(0)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      {/* Quick Navigation Links for Desktop */}
      <div className="hidden md:flex items-center gap-6 ml-4">
        <Link
          href="/requests"
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          <Heart className="h-4 w-4" />
          Demandes
        </Link>
        <Link
          href="/hospitals"
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          <Building2 className="h-4 w-4" />
          Hôpitaux
        </Link>
        <Link
          href="/donors"
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          <Users className="h-4 w-4" />
          Donneurs
        </Link>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className={cn("relative", showNotifications ? "bg-red-50 text-hero-red border-hero-red" : "")}
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5" />
            <AnimatePresence>
              {notificationCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="notification-badge bg-alert-coral"
                >
                  {notificationCount}
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Notifications</span>
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
              >
                <div className="p-4 bg-gradient-to-r from-hero-red to-red-500 text-white">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Aucune notification</div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="notification-item">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-1 flex-shrink-0 w-2 h-2 rounded-full",
                              notification.type === "urgent" ? "bg-alert-coral" : "bg-blue-400",
                            )}
                          ></div>
                          <div className="flex-1">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 text-center">
                  <Link href="/dashboard/notifications" className="text-sm text-hero-red hover:underline">
                    Voir toutes les notifications
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="/images/donor-avatar.png" alt="Avatar" />
                <AvatarFallback className="bg-hero-red text-white">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2 bg-gradient-to-r from-hero-red to-red-500 text-white rounded-t-md">
              <p className="font-medium">{user?.name || "Utilisateur"}</p>
              <p className="text-xs text-white/80">{user?.email || "utilisateur@exemple.com"}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/profile" className="flex items-center gap-2 w-full">
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-hero-red">
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
