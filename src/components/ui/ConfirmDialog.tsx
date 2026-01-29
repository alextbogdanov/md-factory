// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

// ============================================================================
// ### TYPES ###
// ============================================================================
interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: {
      icon: 'bg-error/10 text-error',
      button: 'bg-error hover:bg-error/90',
    },
    warning: {
      icon: 'bg-warning/10 text-warning',
      button: 'bg-warning hover:bg-warning/90',
    },
    default: {
      icon: 'bg-accent/10 text-accent',
      button: 'bg-accent hover:bg-accent-hover',
    },
  }

  const styles = variantStyles[variant]

  return (
    <AnimatePresence>
      {open && (
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
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${styles.icon}`}
              >
                <AlertTriangle className="h-6 w-6" />
              </div>

              {/* Title */}
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {title}
              </h3>

              {/* Description */}
              <p className="mb-6 text-sm text-foreground-secondary">
                {description}
              </p>

              {/* Actions */}
              <div className="flex w-full gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-secondary"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${styles.button}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
