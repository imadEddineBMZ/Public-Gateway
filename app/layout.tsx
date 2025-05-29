import ClientLayout from "@/components/client-layout"
import "./globals.css"

export const metadata = {
  title: "DonorConnect | Plateforme de don de sang",
  description: "Connecter les donneurs de sang aux hôpitaux qui en ont besoin",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white font-sans antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

