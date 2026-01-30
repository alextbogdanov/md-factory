// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Copy, Trash2, Check, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'

// ============================================================================
// ### CONVEX ###
// ============================================================================
import { api } from '../../../convex/_generated/api'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import { ConfirmDialog } from '../ui/ConfirmDialog'

// ============================================================================
// ### UTILITIES ###
// ============================================================================
import { generateMarkdown } from '../../lib/parseMarkdown'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Doc } from '../../../convex/_generated/dataModel'

interface ProjectCardProps {
  project: Doc<'projects'> & { ruleCount: number }
  onEdit: () => void
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isCopyLoading, setIsCopyLoading] = useState(false)

  // Fetch project details when expanded OR when loading for copy
  const projectDetails = useQuery(
    api.projects.get,
    isExpanded || isCopyLoading ? { id: project._id } : 'skip'
  )
  const removeProject = useMutation(api.projects.remove)

  const handleDelete = async () => {
    await removeProject({ id: project._id })
    setShowDeleteConfirm(false)
  }

  // Effect to perform copy once data is loaded during copy loading state
  useEffect(() => {
    if (isCopyLoading && projectDetails?.rules) {
      const markdown = generateMarkdown(
        projectDetails.rules
          .filter((r): r is NonNullable<typeof r> => r !== null)
          .map((r) => ({
            title: r.title,
            body: r.body,
          })),
        project.name
      )

      navigator.clipboard.writeText(markdown).then(() => {
        setCopied(true)
        setIsCopyLoading(false)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }, [isCopyLoading, projectDetails, project.name])

  const handleCopy = async () => {
    // If already have data, copy immediately
    if (projectDetails?.rules) {
      const markdown = generateMarkdown(
        projectDetails.rules
          .filter((r): r is NonNullable<typeof r> => r !== null)
          .map((r) => ({
            title: r.title,
            body: r.body,
          })),
        project.name
      )

      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      // Trigger loading state which will fetch data
      setIsCopyLoading(true)
    }
  }

  const formattedDate = new Date(project.createdAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  )

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-xl border border-border bg-background"
      >
        {/* Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex cursor-pointer items-center justify-between p-4"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-foreground-muted" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-foreground">{project.name}</h3>
              <p className="text-sm text-foreground-muted">
                {project.ruleCount} rule{project.ruleCount !== 1 ? 's' : ''} ·{' '}
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <motion.button
              onClick={onEdit}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-secondary hover:text-foreground"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Pencil className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={handleCopy}
              disabled={isCopyLoading}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-secondary hover:text-foreground disabled:cursor-not-allowed"
              whileHover={{ scale: isCopyLoading ? 1 : 1.05 }}
              whileTap={{ scale: isCopyLoading ? 1 : 0.95 }}
            >
              {isCopyLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
              ) : copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </motion.button>
            <motion.button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-error/10 hover:text-error"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border p-4">
                {projectDetails?.rules ? (
                  <ul className="space-y-2">
                    {projectDetails.rules
                      .filter((rule): rule is NonNullable<typeof rule> => rule !== null)
                      .map((rule, index) => (
                        <li
                          key={rule._id}
                          className="flex items-start gap-3 text-sm"
                        >
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-background-tertiary text-xs font-medium text-foreground-muted">
                            {index + 1}
                          </span>
                          <span className="text-foreground">{rule.title}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  )
}
