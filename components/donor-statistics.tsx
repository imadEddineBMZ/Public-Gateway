"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "@/components/ui/chart"
import { motion } from "framer-motion"

export function DonorStatistics() {
  // Simulation de données pour le graphique
  const donationData = [
    { month: "Jan", donations: 0 },
    { month: "Fév", donations: 1 },
    { month: "Mar", donations: 0 },
    { month: "Avr", donations: 0 },
    { month: "Mai", donations: 1 },
    { month: "Juin", donations: 0 },
  ]

  // Statistiques du donneur
  const stats = {
    totalDonations: 8,
    livesSaved: 24, // Estimation: 3 vies sauvées par don
    lastYearDonations: 2,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="col-span-full lg:col-span-1"
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-400 text-white">
          <CardTitle>Statistiques</CardTitle>
          <CardDescription className="text-purple-100">Aperçu de votre historique de dons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 bg-white">
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow transition-all duration-200"
              whileHover={{ y: -5 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <span className="text-2xl font-bold text-purple-600">{stats.totalDonations}</span>
              <span className="text-xs text-gray-500 text-center">Dons totaux</span>
            </motion.div>
            <motion.div
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow transition-all duration-200"
              whileHover={{ y: -5 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <span className="text-2xl font-bold text-purple-600">{stats.livesSaved}</span>
              <span className="text-xs text-gray-500 text-center">Vies sauvées</span>
            </motion.div>
            <motion.div
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow transition-all duration-200"
              whileHover={{ y: -5 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <span className="text-2xl font-bold text-purple-600">{stats.lastYearDonations}</span>
              <span className="text-xs text-gray-500 text-center">Cette année</span>
            </motion.div>
          </div>

          <motion.div
            className="h-48 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donationData}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} domain={[0, 1]} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="donations" fill="url(#colorDonations)" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
