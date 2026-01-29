// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from 'convex/react'

// ============================================================================
// ### CONVEX ###
// ============================================================================
import { api } from '../../convex/_generated/api'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import { TagCard } from '../components/tags/TagCard'
import { TagModal } from '../components/tags/TagModal'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Id } from '../../convex/_generated/dataModel'

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function TagsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showTagModal, setShowTagModal] = useState(false)
  const [editingTagId, setEditingTagId] = useState<Id<'tags'> | null>(null)

  const tags = useQuery(api.tags.list) ?? []

  const filteredTags = tags.filter(
    (tag) =>
      !searchQuery ||
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEditTag = (tagId: Id<'tags'>) => {
    setEditingTagId(tagId)
    setShowTagModal(true)
  }

  const handleCloseModal = () => {
    setShowTagModal(false)
    setEditingTagId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Tags</h1>
        <motion.button
          onClick={() => setShowTagModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          New Tag
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search tags..."
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tags grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredTags.map((tag) => (
            <TagCard
              key={tag._id}
              tag={tag}
              onEdit={() => handleEditTag(tag._id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredTags.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-secondary">
            <Search className="h-6 w-6 text-foreground-muted" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-foreground">
            No tags found
          </h3>
          <p className="text-sm text-foreground-secondary">
            {tags.length === 0
              ? 'Create your first tag to organize your rules'
              : 'Try adjusting your search'}
          </p>
        </motion.div>
      )}

      {/* Tag modal */}
      <AnimatePresence>
        {showTagModal && (
          <TagModal tagId={editingTagId} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </div>
  )
}
