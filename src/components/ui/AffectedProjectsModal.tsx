// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, ExternalLink, X, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Doc } from '../../../convex/_generated/dataModel'

interface AffectedProjectsModalProps {
  open: boolean
  onClose: () => void
  projects: Doc<'projects'>[]
  ruleName: string
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function AffectedProjectsModal({
  open,
  onClose,
  projects,
  ruleName,
}: AffectedProjectsModalProps) {
  const navigate = useNavigate()

  const handleNavigateToProject = (projectName: string) => {
    onClose()
    // Navigate to projects page - could add search query param in future
    navigate('/projects')
  }

  const handleViewAllProjects = () => {
    onClose()
    navigate('/projects')
  }

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
            className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-border bg-background shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <AlertCircle className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Projects Using This Rule
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
              <p className="mb-4 text-sm text-foreground-secondary">
                The rule <span className="font-medium text-foreground">"{ruleName}"</span> is used in{' '}
                {projects.length} project{projects.length !== 1 ? 's' : ''}. You may want to review
                these projects to ensure they have the latest changes.
              </p>

              {/* Project list */}
              <div className="space-y-2">
                {projects.map((project) => (
                  <motion.button
                    key={project._id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleNavigateToProject(project.name)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-background-secondary p-3 text-left transition-colors hover:border-accent"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                      <FolderOpen className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {project.name}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 text-foreground-muted" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-border p-6">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-secondary"
              >
                Close
              </button>
              <button
                onClick={handleViewAllProjects}
                className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Go to Projects
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
