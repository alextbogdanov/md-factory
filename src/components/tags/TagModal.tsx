// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'

// ============================================================================
// ### CONVEX ###
// ============================================================================
import { api } from '../../../convex/_generated/api'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Id } from '../../../convex/_generated/dataModel'

interface TagModalProps {
  tagId: Id<'tags'> | null
  onClose: () => void
}

// ============================================================================
// ### CONSTANTS ###
// ============================================================================
const COLOR_PALETTE = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
]

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function TagModal({ tagId, onClose }: TagModalProps) {
  const existingTag = useQuery(
    api.tags.get,
    tagId ? { id: tagId } : 'skip'
  )

  const [name, setName] = useState(existingTag?.name ?? '')
  const [color, setColor] = useState(existingTag?.color ?? COLOR_PALETTE[7])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createTag = useMutation(api.tags.create)
  const updateTag = useMutation(api.tags.update)

  // Update form when existing tag loads
  if (existingTag && name === '' && existingTag.name) {
    setName(existingTag.name)
    setColor(existingTag.color)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      if (tagId) {
        await updateTag({ id: tagId, name: name.trim(), color })
      } else {
        await createTag({ name: name.trim(), color })
      }
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
          <h2 className="text-xl font-semibold text-foreground">
            {tagId ? 'Edit Tag' : 'New Tag'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name input */}
          <div>
            <label
              htmlFor="tagName"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              id="tagName"
              type="text"
              placeholder="e.g., React Native"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
              onChange={(e) => setName(e.target.value)}
              defaultValue={existingTag?.name ?? ''}
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-lg transition-transform hover:scale-110 ${
                    color === c ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Preview
            </label>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium">
                {name || 'Tag name'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-secondary hover:bg-background-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : tagId ? 'Save Changes' : 'Create Tag'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
