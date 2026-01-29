// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'
import { FileUp, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from 'convex/react'

// ============================================================================
// ### CONVEX ###
// ============================================================================
import { api } from '../../convex/_generated/api'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import { RuleCard } from '../components/rules/RuleCard'
import { RuleModal } from '../components/rules/RuleModal'
import { ImportModal } from '../components/rules/ImportModal'
import { TagChip } from '../components/tags/TagChip'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Id } from '../../convex/_generated/dataModel'

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function RulesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<Id<'tags'>[]>([])
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editingRuleId, setEditingRuleId] = useState<Id<'rules'> | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  const rules = useQuery(api.rules.list) ?? []
  const tags = useQuery(api.tags.list) ?? []

  // Filter rules by search query and selected tags
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      !searchQuery ||
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.body.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tagId) => rule.tags.some((t) => t?._id === tagId))

    return matchesSearch && matchesTags
  })

  const toggleTag = (tagId: Id<'tags'>) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleEditRule = (ruleId: Id<'rules'>) => {
    setEditingRuleId(ruleId)
    setShowRuleModal(true)
  }

  const handleCloseModal = () => {
    setShowRuleModal(false)
    setEditingRuleId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Rules</h1>
        <div className="flex gap-2">
          <motion.button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileUp className="h-4 w-4" />
            Import .md
          </motion.button>
          <motion.button
            onClick={() => setShowRuleModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-4 w-4" />
            New Rule
          </motion.button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search rules..."
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip
              key={tag._id}
              tag={tag}
              selected={selectedTags.includes(tag._id)}
              onClick={() => toggleTag(tag._id)}
            />
          ))}
        </div>
      )}

      {/* Rules grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredRules.map((rule) => (
            <RuleCard
              key={rule._id}
              rule={rule}
              onEdit={() => handleEditRule(rule._id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredRules.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-secondary">
            <Search className="h-6 w-6 text-foreground-muted" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-foreground">
            No rules found
          </h3>
          <p className="text-sm text-foreground-secondary">
            {rules.length === 0
              ? 'Create your first rule or import from an existing CLAUDE.md'
              : 'Try adjusting your search or filters'}
          </p>
        </motion.div>
      )}

      {/* Rule modal */}
      <AnimatePresence>
        {showRuleModal && (
          <RuleModal
            ruleId={editingRuleId}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>

      {/* Import modal */}
      <AnimatePresence>
        {showImportModal && (
          <ImportModal onClose={() => setShowImportModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
