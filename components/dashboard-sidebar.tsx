"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Home, Heart, User, LogOut, Bell, Building2, Users, HandHeart } from "lucide-react"
import { motion } from "framer-motion"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      label: "Tableau de bord",
    },
    {
      href: "/requests",
      icon: Heart,
      label: "Demandes de sang",
    },
    {
      href: "/hospitals",
      icon: Building2,
      label: "Hôpitaux",
    },
    {
      href: "/donors",
      icon: Users,
      label: "Donneurs",
    },
    {
      href: "/dashboard/pledges",
      icon: HandHeart,
      label: "Mes engagements",
    },
    {
      href: "/dashboard/notifications",
      icon: Bell,
      label: "Mes abonnements",
    },
    {
      href: "/dashboard/profile",
      icon: User,
      label: "Profil",
    },
  ]

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-6 flex items-center gap-2">
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
        <span className="text-xl font-bold text-trust-blue">DonorConnect</span>
      </div>
      <div className="flex-1 px-4 space-y-2 py-4">
        {routes.map((route) => {
          const isActive = pathname === route.href

          return (
            <Link key={route.href} href={route.href} className="relative block">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-hero-red group",
                  isActive ? "text-hero-red font-medium" : "",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 bg-red-50 rounded-lg z-0"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <route.icon
                  className={cn(
                    "h-5 w-5 z-10 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-hero-red" : "",
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
          className="w-full justify-start text-gray-500 hover:text-hero-red hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
