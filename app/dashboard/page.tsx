"use client"

import { useAuth } from "@/components/auth-provider"
import { DonationStatus } from "@/components/donation-status"
import { NearbyRequests } from "@/components/nearby-requests"
import { DonationHistory } from "@/components/donation-history"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-trust-blue">Bonjour, {user?.name.split(" ")[0]} 👋</h1>
          <p className="text-gray-500">Bienvenue sur votre tableau de bord de donneur de sang</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DonationStatus />
        <NearbyRequests />
      </div>

      <DonationHistory />
    </div>
  )
}
