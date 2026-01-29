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
import { ConfirmDialog } from '../ui/ConfirmDialog'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Doc } from '../../../convex/_generated/dataModel'

interface TagCardProps {
  tag: Doc<'tags'>
  onEdit: () => void
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function TagCard({ tag, onEdit }: TagCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const ruleCount = useQuery(api.tags.getRuleCount, { tagId: tag._id })
  const removeTag = useMutation(api.tags.remove)

  const handleDelete = async () => {
    await removeTag({ id: tag._id })
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -2 }}
        onClick={onEdit}
        className="group relative cursor-pointer rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-md"
      >
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowDeleteConfirm(true)
          }}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-foreground-muted opacity-0 transition-all hover:bg-error/10 hover:text-error group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Tag color and name */}
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg"
            style={{ backgroundColor: tag.color }}
          />
          <div>
            <h3 className="font-medium text-foreground">{tag.name}</h3>
            <p className="text-sm text-foreground-muted">
              {ruleCount ?? 0} rule{ruleCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete tag"
        description={
          ruleCount && ruleCount > 0
            ? `This tag is used by ${ruleCount} rule${ruleCount !== 1 ? 's' : ''}. Remove from all and delete?`
            : 'Are you sure you want to delete this tag?'
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  )
}
