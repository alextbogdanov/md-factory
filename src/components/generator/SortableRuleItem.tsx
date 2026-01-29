// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion } from 'framer-motion'
import { GripVertical, X } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Doc } from '../../../convex/_generated/dataModel'

interface SortableRuleItemProps {
  rule: Doc<'rules'> & { tags: (Doc<'tags'> | null)[] }
  index: number
  onRemove: () => void
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function SortableRuleItem({
  rule,
  index,
  onRemove,
}: SortableRuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center gap-3 rounded-lg border bg-background p-3 ${
        isDragging
          ? 'border-accent shadow-lg'
          : 'border-border'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-foreground-muted hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Number */}
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
        {index + 1}
      </span>

      {/* Title */}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {rule.title}
      </span>

      {/* Remove button */}
      <motion.button
        onClick={onRemove}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-foreground-muted hover:bg-error/10 hover:text-error"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="h-4 w-4" />
      </motion.button>
    </motion.div>
  )
}
