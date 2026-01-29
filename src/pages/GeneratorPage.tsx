// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import { Builder } from '../components/generator/Builder'

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function GeneratorPage() {
  const [isBuilding, setIsBuilding] = useState(false)

  if (isBuilding) {
    return <Builder onCancel={() => setIsBuilding(false)} />
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
            <Sparkles className="h-10 w-10 text-accent" />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-foreground">
          Create Your CLAUDE.md
        </h1>
        <p className="mb-8 max-w-md text-foreground-secondary">
          Select rules from your collection to generate a customized CLAUDE.md
          file for your project.
        </p>
        <motion.button
          onClick={() => setIsBuilding(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-colors hover:bg-accent-hover"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-5 w-5" />
          Create New .md
        </motion.button>
      </motion.div>
    </div>
  )
}
