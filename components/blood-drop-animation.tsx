"use client"
import { motion } from "framer-motion"

export function BloodDropAnimation() {
  return (
    <motion.div
      className="w-16 h-16 relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 bg-red-600 rounded-full transform -translate-y-1/4"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{
          duration: 1,
          ease: "easeOut",
          delay: 0.2,
        }}
      />
      <motion.div
        className="absolute inset-0 bg-red-600"
        style={{
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          transformOrigin: "center bottom",
        }}
        initial={{ scaleY: 0.7, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.3,
        }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        +
      </motion.div>
    </motion.div>
  )
}
