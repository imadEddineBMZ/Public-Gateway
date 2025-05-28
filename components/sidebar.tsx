"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, History, User, LogOut, Heart } from "lucide-react"
import { motion } from "framer-motion"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      label: "Accueil",
    },
    {
      href: "/dashboard/donations",
      icon: History,
      label: "Historique",
    },
    {
      href: "/dashboard/profile",
      icon: User,
      label: "Profil",
    },
  ]

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
          DonorConnect
        </h2>
      </div>
      <div className="flex-1 px-4 space-y-2 py-4">
        {routes.map((route) => {
          const isActive = pathname === route.href

          return (
            <Link key={route.href} href={route.href} className="relative block">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-500 transition-all hover:text-red-600 group",
                  isActive ? "text-red-600 font-medium" : "",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 bg-red-50 rounded-xl z-0"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <route.icon
                  className={cn(
                    "h-5 w-5 z-10 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-red-600" : "",
                  )}
                />
                <span className="z-10">{route.label}</span>
              </div>
            </Link>
          )
        })}
      </div>
      <div className="p-4 mt-auto border-t border-gray-100">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
