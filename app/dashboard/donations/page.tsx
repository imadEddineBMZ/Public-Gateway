import { DonationsTable } from "@/components/donations-table"

export default function DonationsPage() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/2"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Historique des dons</h1>
          <p className="mt-2 text-blue-100 max-w-lg">
            Consultez tous vos dons de sang précédents et téléchargez vos certificats.
          </p>
        </div>
      </div>
      <DonationsTable />
    </div>
  )
}
