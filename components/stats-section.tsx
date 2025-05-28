"use client"

import { motion } from "framer-motion"

export function StatsSection() {
  const stats = [
    { value: "15K+", label: "Donneurs" },
    { value: "5K+", label: "Vies sauvées" },
    { value: "48", label: "Wilayas" },
    { value: "200+", label: "Hôpitaux" },
  ]

  return (
    <section className="py-16 bg-trust-blue text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Notre impact</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Ensemble, nous créons un réseau de donneurs de sang qui sauvent des vies à travers tout le pays.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-blue-200">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
