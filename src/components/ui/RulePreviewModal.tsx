// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText } from 'lucide-react'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import { TagChip } from '../tags/TagChip'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Doc } from '../../../convex/_generated/dataModel'

interface RulePreviewModalProps {
  rule: (Doc<'rules'> & { tags: (Doc<'tags'> | null)[] }) | null
  onClose: () => void
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function RulePreviewModal({ rule, onClose }: RulePreviewModalProps) {
  return (
    <AnimatePresence>
      {rule && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-background shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {rule.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tags */}
              {rule.tags.filter(Boolean).length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {rule.tags.filter(Boolean).map((tag) => (
                    <TagChip key={tag!._id} tag={tag!} size="sm" />
                  ))}
                </div>
              )}

              {/* Rule body */}
              <div className="rounded-lg border border-border bg-background-secondary p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
                  {rule.body}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-border p-6">
              <button
                onClick={onClose}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
