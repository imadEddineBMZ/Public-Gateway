"use client"

import { motion } from "framer-motion"
import { UserRound, ListFilter, Heart, Bell } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: <UserRound className="w-8 h-8 text-hero-red" />,
      title: "Créez votre profil",
      description: "Inscrivez-vous avec votre type de sang, votre wilaya et vos informations de santé de base.",
    },
    {
      icon: <ListFilter className="w-8 h-8 text-hero-red" />,
      title: "Trouvez des demandes",
      description: "Parcourez les demandes de sang compatibles dans votre région, filtrées par urgence et proximité.",
    },
    {
      icon: <Heart className="w-8 h-8 text-hero-red" />,
      title: "Engagez-vous à donner",
      description:
        "Engagez-vous pour une demande et recevez les coordonnées de l'hôpital et les instructions pour le don.",
    },
    {
      icon: <Bell className="w-8 h-8 text-hero-red" />,
      title: "Restez informé",
      description:
        "Recevez des notifications sur les demandes urgentes et suivez votre historique de dons et vos récompenses.",
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-trust-blue mb-4">Comment ça marche</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            DonorConnect simplifie le processus de don de sang en vous connectant directement avec les hôpitaux qui ont
            besoin de votre aide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-trust-blue mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
