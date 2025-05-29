"use client"

import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import ClientOnly from "@/components/client-only"
import { MainNavigation } from "@/components/main-nav"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <ClientOnly fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        }>
          <main className="flex min-h-screen flex-col">
            <MainNavigation />
            <div className="flex-1">
              {children}
            </div>
          </main>
          <Toaster />
        </ClientOnly>
      </AuthProvider>
    </ThemeProvider>
  )
}