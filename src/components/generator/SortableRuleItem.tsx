// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion } from 'framer-motion'
import { GripVertical, X, Eye } from 'lucide-react'
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
  onPreview: () => void
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function SortableRuleItem({
  rule,
  index,
  onRemove,
  onPreview,
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
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex items-center gap-3 rounded-lg border bg-background p-3 ${
        isDragging
          ? 'border-accent shadow-lg z-50'
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

      {/* Preview button */}
      <motion.button
        onClick={onPreview}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-foreground-muted hover:bg-accent/10 hover:text-accent"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Eye className="h-4 w-4" />
      </motion.button>

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

// ============================================================================
// ### OVERLAY COMPONENT ###
// ============================================================================
interface DragOverlayItemProps {
  rule: Doc<'rules'> & { tags: (Doc<'tags'> | null)[] }
  index: number
}

export function DragOverlayItem({ rule, index }: DragOverlayItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-accent bg-background p-3 shadow-xl">
      {/* Drag handle */}
      <span className="cursor-grabbing text-foreground-muted">
        <GripVertical className="h-4 w-4" />
      </span>

      {/* Number */}
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
        {index + 1}
      </span>

      {/* Title */}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {rule.title}
      </span>

      {/* Preview button placeholder */}
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-foreground-muted">
        <Eye className="h-4 w-4" />
      </span>

      {/* Remove button placeholder */}
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-foreground-muted">
        <X className="h-4 w-4" />
      </span>
    </div>
  )
}
