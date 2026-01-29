// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'

// ============================================================================
// ### CONVEX ###
// ============================================================================
import { api } from '../../../convex/_generated/api'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import { TagChip } from '../tags/TagChip'
import { ConfirmDialog } from '../ui/ConfirmDialog'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Doc } from '../../../convex/_generated/dataModel'

interface RuleCardProps {
  rule: Doc<'rules'> & { tags: (Doc<'tags'> | null)[] }
  onEdit: () => void
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: () => void
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function RuleCard({
  rule,
  onEdit,
  selectable = false,
  selected = false,
  onToggleSelect,
}: RuleCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const projects = useQuery(api.projects.getProjectsUsingRule, { ruleId: rule._id })
  const removeRule = useMutation(api.rules.remove)

  const handleDelete = async () => {
    await removeRule({ id: rule._id })
    setShowDeleteConfirm(false)
  }

  const handleClick = () => {
    if (selectable && onToggleSelect) {
      onToggleSelect()
    } else {
      onEdit()
    }
  }

  // Truncate body for preview
  const bodyPreview = rule.body.slice(0, 150) + (rule.body.length > 150 ? '...' : '')

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -2 }}
        onClick={handleClick}
        className={`group relative cursor-pointer rounded-xl border bg-background p-4 transition-all hover:shadow-md ${
          selected
            ? 'border-accent ring-2 ring-accent/20'
            : 'border-border'
        }`}
      >
        {/* Selection indicator */}
        {selectable && (
          <div
            className={`absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
              selected
                ? 'border-accent bg-accent text-white'
                : 'border-border-strong bg-background'
            }`}
          >
            {selected && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-3 w-3"
                viewBox="0 0 12 12"
              >
                <path
                  fill="currentColor"
                  d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06L4.25 7.19l4.97-4.97a.75.75 0 0 1 1.06.06Z"
                />
              </motion.svg>
            )}
          </div>
        )}

        {/* Delete button - only show if not in selectable mode */}
        {!selectable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteConfirm(true)
            }}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-foreground-muted opacity-0 transition-all hover:bg-error/10 hover:text-error group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {/* Content */}
        <div className={selectable ? 'pl-6' : ''}>
          <h3 className="mb-2 font-semibold text-foreground">{rule.title}</h3>
          <p className="mb-3 text-sm leading-relaxed text-foreground-secondary">
            {bodyPreview}
          </p>

          {/* Tags */}
          {rule.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {rule.tags
                .filter(Boolean)
                .slice(0, 3)
                .map((tag) => (
                  <TagChip key={tag!._id} tag={tag!} size="sm" />
                ))}
              {rule.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs text-foreground-muted">
                  +{rule.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Project count */}
          {!selectable && projects && projects.length > 0 && (
            <p className="text-xs text-foreground-muted">
              Used in {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </motion.div>

      {/* Delete confirmation */}
      {!selectable && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete rule"
          description={
            projects && projects.length > 0
              ? `This rule is used in ${projects.length} project${projects.length !== 1 ? 's' : ''}. Are you sure you want to delete it?`
              : 'Are you sure you want to delete this rule?'
          }
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </>
  )
}
