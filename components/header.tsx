"use client"

import { useState } from "react"
import { Bell, Menu, Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [notificationCount, setNotificationCount] = useState(3)
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden rounded-full">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <AnimatePresence>
        {showSearch ? (
          <motion.div
            className="flex-1 max-w-md"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-9 h-10 bg-gray-50 border-none focus:ring-red-400"
                autoFocus
                onBlur={() => setShowSearch(false)}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-5 w-5 text-gray-500" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-500" />
              {notificationCount > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1">
                  <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-to-r from-red-600 to-red-500">
                    {notificationCount}
                  </Badge>
                </motion.div>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-xl border-gray-100">
            <DropdownMenuLabel className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0" />
            <div className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem className="cursor-pointer p-4 hover:bg-gray-50 focus:bg-gray-50">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Rappel de rendez-vous</p>
                  <p className="text-sm text-gray-500">Votre rendez-vous est prévu pour demain à 10h00</p>
                  <p className="text-xs text-gray-400 mt-1">Il y a 2 heures</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="m-0" />
              <DropdownMenuItem className="cursor-pointer p-4 hover:bg-gray-50 focus:bg-gray-50">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Éligibilité au don</p>
                  <p className="text-sm text-gray-500">Vous êtes maintenant éligible pour donner du sang</p>
                  <p className="text-xs text-gray-400 mt-1">Il y a 1 jour</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="m-0" />
              <DropdownMenuItem className="cursor-pointer p-4 hover:bg-gray-50 focus:bg-gray-50">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Besoin urgent</p>
                  <p className="text-sm text-gray-500">Besoin urgent de donneurs de type O négatif</p>
                  <p className="text-xs text-gray-400 mt-1">Il y a 2 jours</p>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white">JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-0 overflow-hidden rounded-xl border-gray-100">
            <div className="p-4 bg-gradient-to-r from-red-600 to-red-500 text-white">
              <p className="font-medium">Jean Dupont</p>
              <p className="text-sm text-red-100">jean.dupont@example.com</p>
            </div>
            <DropdownMenuSeparator className="m-0" />
            <DropdownMenuItem asChild className="p-3 cursor-pointer">
              <a href="/dashboard/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="m-0" />
            <DropdownMenuItem asChild className="p-3 cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700">
              <a href="/" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
