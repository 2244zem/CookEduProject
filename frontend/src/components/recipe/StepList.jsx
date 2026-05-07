/**
 * StepList Component — Langkah-langkah memasak
 * 
 * Menampilkan instruksi bernomor dengan opsi gambar per langkah.
 * Desain timeline vertikal agar mudah diikuti saat memasak.
 */

import { motion } from 'framer-motion';
import { ListOrdered } from 'lucide-react';

export default function StepList({ steps = [] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-charcoal-800 flex items-center gap-2">
        <ListOrdered className="w-5 h-5 text-terracotta-500" />
        Cara Membuat
      </h3>

      <ol className="relative space-y-6">
        {steps.map((step, index) => (
          <motion.li
            key={step.id || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4"
          >
            {/* Step number — lingkaran terracotta */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-terracotta-500 text-white flex items-center justify-center text-sm font-semibold">
                {step.step_number || index + 1}
              </div>
              {/* Garis penghubung (kecuali langkah terakhir) */}
              {index < steps.length - 1 && (
                <div className="w-px h-full bg-cream-300 mx-auto mt-2" />
              )}
            </div>

            {/* Instruction content */}
            <div className="flex-1 pb-6">
              <p className="text-sm text-charcoal-700 leading-relaxed">
                {step.instruction}
              </p>

              {/* Gambar opsional per langkah */}
              {step.image_url && (
                <div className="mt-3 rounded-lg overflow-hidden border border-cream-200">
                  <img
                    src={step.image_url}
                    alt={`Langkah ${step.step_number || index + 1}`}
                    className="w-full max-w-md object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
