"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider"

export default function Home() {
  const { user } = useAuth()

  return (<>
        <main className="flex-grow">
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
      </main>

      <Footer />

  </>
    


    
  )
}
