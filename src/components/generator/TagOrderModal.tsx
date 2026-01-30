// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, X, ArrowUpDown } from 'lucide-react'
import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ============================================================================
// ### TYPES ###
// ============================================================================
interface Tag {
  _id: string
  name: string
  color: string
}

interface TagOrderModalProps {
  open: boolean
  onClose: () => void
  tags: Tag[]
  onApply: (orderedTagIds: string[]) => void
}

interface SortableTagItemProps {
  tag: Tag
  index: number
}

// ============================================================================
// ### SORTABLE TAG ITEM ###
// ============================================================================
function SortableTagItem({ tag, index }: SortableTagItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag._id })

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
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex items-center gap-3 rounded-lg border bg-background p-3 ${
        isDragging ? 'border-accent shadow-lg z-50' : 'border-border'
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

      {/* Priority number */}
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-background-secondary text-xs font-medium text-foreground-secondary">
        {index + 1}
      </span>

      {/* Tag chip */}
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1"
        style={{
          backgroundColor: `${tag.color}20`,
          color: tag.color,
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
        <span className="text-sm font-medium">{tag.name}</span>
      </div>
    </motion.div>
  )
}

// ============================================================================
// ### DRAG OVERLAY TAG ITEM ###
// ============================================================================
function DragOverlayTagItem({ tag, index }: SortableTagItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-accent bg-background p-3 shadow-xl">
      {/* Drag handle */}
      <span className="cursor-grabbing text-foreground-muted">
        <GripVertical className="h-4 w-4" />
      </span>

      {/* Priority number */}
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-background-secondary text-xs font-medium text-foreground-secondary">
        {index + 1}
      </span>

      {/* Tag chip */}
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1"
        style={{
          backgroundColor: `${tag.color}20`,
          color: tag.color,
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
        <span className="text-sm font-medium">{tag.name}</span>
      </div>
    </div>
  )
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function TagOrderModal({
  open,
  onClose,
  tags,
  onApply,
}: TagOrderModalProps) {
  const [orderedTags, setOrderedTags] = useState<Tag[]>(tags)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update ordered tags when props change
  if (tags.length !== orderedTags.length ||
      tags.some((t) => !orderedTags.find(ot => ot._id === t._id))) {
    setOrderedTags(tags)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (over && active.id !== over.id) {
      setOrderedTags((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id)
        const newIndex = items.findIndex((item) => item._id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const activeTag = activeId
    ? orderedTags.find((t) => t._id === activeId)
    : null
  const activeIndex = activeId
    ? orderedTags.findIndex((t) => t._id === activeId)
    : -1

  const handleApply = () => {
    onApply(orderedTags.map((t) => t._id))
    onClose()
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
            className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <ArrowUpDown className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Order by Tags
                  </h2>
                  <p className="text-sm text-foreground-muted">
                    Drag tags to set rule priority
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tag list */}
            {orderedTags.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedTags.map((t) => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="mb-6 max-h-[40vh] space-y-2 overflow-y-auto">
                    {orderedTags.map((tag, index) => (
                      <SortableTagItem key={tag._id} tag={tag} index={index} />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeTag && (
                    <DragOverlayTagItem tag={activeTag} index={activeIndex} />
                  )}
                </DragOverlay>
              </DndContext>
            ) : (
              <div className="mb-6 flex flex-col items-center py-8 text-center">
                <ArrowUpDown className="mb-2 h-8 w-8 text-foreground-muted" />
                <p className="text-sm text-foreground-secondary">
                  No tags in selected rules
                </p>
              </div>
            )}

            {/* Info text */}
            <p className="mb-4 text-xs text-foreground-muted">
              Rules will be sorted by their highest-priority tag. Rules without tags will appear at the end.
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-secondary hover:bg-background-secondary"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleApply}
                disabled={orderedTags.length === 0}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply Order
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
