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
// ### COMPONENTS ###
// ============================================================================
import { TagChip } from '../tags/TagChip'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Id } from '../../../convex/_generated/dataModel'

interface RuleModalProps {
  ruleId: Id<'rules'> | null
  onClose: () => void
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function RuleModal({ ruleId, onClose }: RuleModalProps) {
  const existingRule = useQuery(api.rules.get, ruleId ? { id: ruleId } : 'skip')
  const tags = useQuery(api.tags.list) ?? []

  const [title, setTitle] = useState(existingRule?.title ?? '')
  const [body, setBody] = useState(existingRule?.body ?? '')
  const [selectedTagIds, setSelectedTagIds] = useState<Id<'tags'>[]>(
    existingRule?.tags.map((t) => t?._id).filter(Boolean) as Id<'tags'>[] ?? []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createRule = useMutation(api.rules.create)
  const updateRule = useMutation(api.rules.update)

  // Update form when existing rule loads
  if (existingRule && title === '' && existingRule.title) {
    setTitle(existingRule.title)
    setBody(existingRule.body)
    setSelectedTagIds(
      existingRule.tags.map((t) => t?._id).filter(Boolean) as Id<'tags'>[]
    )
  }

  const toggleTag = (tagId: Id<'tags'>) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    setIsSubmitting(true)
    try {
      if (ruleId) {
        await updateRule({
          id: ruleId,
          title: title.trim(),
          body: body.trim(),
          tagIds: selectedTagIds,
        })
      } else {
        await createRule({
          title: title.trim(),
          body: body.trim(),
          tagIds: selectedTagIds,
        })
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
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-background shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-xl font-semibold text-foreground">
            {ruleId ? 'Edit Rule' : 'New Rule'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* Title input */}
            <div>
              <label
                htmlFor="ruleTitle"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Title
              </label>
              <input
                id="ruleTitle"
                type="text"
                placeholder="e.g., React Native TextInput"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                onChange={(e) => setTitle(e.target.value)}
                defaultValue={existingRule?.title ?? ''}
                autoFocus
              />
            </div>

            {/* Body textarea */}
            <div>
              <label
                htmlFor="ruleBody"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Content (Markdown)
              </label>
              <textarea
                id="ruleBody"
                placeholder="Write your rule content here..."
                rows={10}
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                onChange={(e) => setBody(e.target.value)}
                defaultValue={existingRule?.body ?? ''}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Tags
              </label>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagChip
                      key={tag._id}
                      tag={tag}
                      selected={selectedTagIds.includes(tag._id)}
                      onClick={() => toggleTag(tag._id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground-muted">
                  No tags yet. Create tags in the Tags page.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border p-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-secondary hover:bg-background-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !body.trim() || isSubmitting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : ruleId ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
