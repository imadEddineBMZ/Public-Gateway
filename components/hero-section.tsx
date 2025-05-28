"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-white to-red-50">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-trust-blue leading-tight">
            Sauvez des vies avec <span className="text-hero-red">votre don de sang</span>
          </h1>
          <p className="text-lg text-gray-600">
            Connectez-vous directement avec les hôpitaux qui ont besoin de votre type de sang dans votre région. Recevez
            des notifications en temps réel et suivez votre impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-hero-red hover:bg-hero-red/90 text-white w-full sm:w-auto">
                Devenir donneur
              </Button>
            </Link>
            <Link href="/requests">
              <Button
                size="lg"
                variant="outline"
                className="border-hero-red text-hero-red hover:bg-red-50 w-full sm:w-auto"
              >
                Voir les demandes
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/red-drop-hero.png"
              alt="Don de sang - Red Drop"
              width={600}
              height={600}
              className="w-full h-auto object-contain bg-white p-8"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-hero-red rounded-full opacity-20 blur-xl"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-trust-blue rounded-full opacity-20 blur-xl"></div>
        </motion.div>
      </div>
    </section>
  )
}
