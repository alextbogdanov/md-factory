// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, FileText, FolderOpen } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
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
} from '@dnd-kit/sortable'

// ============================================================================
// ### CONVEX ###
// ============================================================================
import { api } from '../../../convex/_generated/api'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import { RuleCard } from '../rules/RuleCard'
import { TagChip } from '../tags/TagChip'
import { SortableRuleItem, DragOverlayItem } from '../generator/SortableRuleItem'
import { RulePreviewModal } from '../ui/RulePreviewModal'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Id, Doc } from '../../../convex/_generated/dataModel'

type RuleWithTags = Doc<'rules'> & { tags: (Doc<'tags'> | null)[] }

interface ProjectEditModalProps {
  projectId: Id<'projects'> | null
  onClose: () => void
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function ProjectEditModal({ projectId, onClose }: ProjectEditModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<Id<'tags'>[]>([])
  const [selectedRules, setSelectedRules] = useState<RuleWithTags[]>([])
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [previewRule, setPreviewRule] = useState<RuleWithTags | null>(null)
  const [activeId, setActiveId] = useState<Id<'rules'> | null>(null)
  // Track which project we've initialized for, using a counter to handle same-project reopens
  const [initKey, setInitKey] = useState<string | null>(null)

  const project = useQuery(
    api.projects.get,
    projectId ? { id: projectId } : 'skip'
  )
  const rules = useQuery(api.rules.list) ?? []
  const tags = useQuery(api.tags.list) ?? []
  const updateProject = useMutation(api.projects.update)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Generate a unique key for this modal session based on project ID and when it was last updated
  // This ensures we reinitialize when opening a different project OR when the same project has been updated
  const projectVersion = project ? `${project._id}-${project.updatedAt ?? project._creationTime}` : null

  // Initialize state when project loads or when project data has changed
  useEffect(() => {
    if (project && projectId && projectVersion && initKey !== projectVersion) {
      const validRules = project.rules.filter((r): r is RuleWithTags => r !== null)
      console.log('Initializing project state:', {
        projectId,
        projectVersion,
        initKey,
        ruleCount: validRules.length,
        ruleIds: validRules.map((r) => r._id),
      })
      setProjectName(project.name)
      setSelectedRules(validRules)
      setInitKey(projectVersion)
    }
  }, [project, projectId, projectVersion, initKey])

  // Reset state when modal closes
  useEffect(() => {
    if (!projectId) {
      setProjectName('')
      setSelectedRules([])
      setSearchQuery('')
      setSelectedTagIds([])
      setInitKey(null)
    }
  }, [projectId])

  // Filter rules
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      !searchQuery ||
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.body.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags =
      selectedTagIds.length === 0 ||
      selectedTagIds.some((tagId) => rule.tags.some((t) => t?._id === tagId))

    return matchesSearch && matchesTags
  })

  const toggleTag = (tagId: Id<'tags'>) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  const addRule = (rule: RuleWithTags) => {
    if (selectedRules.some((r) => r._id === rule._id)) {
      console.log('Rule already selected:', rule._id)
      return
    }
    console.log('Adding rule:', rule._id, rule.title)
    setSelectedRules((prev) => [...prev, rule])
  }

  const removeRule = (ruleId: Id<'rules'>) => {
    setSelectedRules((prev) => prev.filter((r) => r._id !== ruleId))
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as Id<'rules'>)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (over && active.id !== over.id) {
      setSelectedRules((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id)
        const newIndex = items.findIndex((item) => item._id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Get active rule for drag overlay
  const activeRule = activeId
    ? selectedRules.find((r) => r._id === activeId)
    : null
  const activeIndex = activeId
    ? selectedRules.findIndex((r) => r._id === activeId)
    : -1

  const handleSave = async () => {
    if (!projectId || !projectName.trim() || selectedRules.length === 0) return

    const ruleIds = selectedRules.map((r) => r._id)
    console.log('Saving project with rules:', ruleIds)

    setIsSaving(true)
    try {
      await updateProject({
        id: projectId,
        name: projectName.trim(),
        ruleIds,
      })
      console.log('Project saved successfully')
      onClose()
    } catch (error) {
      console.error('Failed to save project:', error)
      // Keep modal open on error so user can retry
    } finally {
      setIsSaving(false)
    }
  }

  const canSave = projectName.trim() && selectedRules.length > 0

  return (
    <AnimatePresence>
      {projectId && (
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
            className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-background shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <FolderOpen className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Edit Project
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Loading state */}
            {!project && (
              <div className="flex flex-1 items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            )}

            {/* Content */}
            {project && (
              <div className="flex flex-1 flex-col overflow-hidden p-6">
                {/* Project name input */}
                <div className="mb-6">
                  <label
                    htmlFor="editProjectName"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Project Name
                  </label>
                  <input
                    id="editProjectName"
                    type="text"
                    value={projectName}
                    placeholder="e.g., my-mobile-app"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                {/* Two-panel layout */}
                <div className="grid flex-1 gap-6 overflow-hidden lg:grid-cols-2">
                  {/* Left panel - Rule selection */}
                  <div className="flex flex-col space-y-4 overflow-hidden">
                    <h3 className="text-sm font-medium text-foreground-secondary">
                      Available Rules
                    </h3>

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
                            size="sm"
                            selected={selectedTagIds.includes(tag._id)}
                            onClick={() => toggleTag(tag._id)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Rules list */}
                    <div className="flex-1 space-y-3 overflow-y-auto">
                      {filteredRules.map((rule) => (
                        <RuleCard
                          key={rule._id}
                          rule={rule}
                          onEdit={() => {}}
                          selectable
                          selected={selectedRules.some((r) => r._id === rule._id)}
                          onToggleSelect={() =>
                            selectedRules.some((r) => r._id === rule._id)
                              ? removeRule(rule._id)
                              : addRule(rule)
                          }
                        />
                      ))}
                      {filteredRules.length === 0 && (
                        <div className="flex flex-col items-center py-8 text-center">
                          <Search className="mb-2 h-8 w-8 text-foreground-muted" />
                          <p className="text-sm text-foreground-secondary">
                            No rules found
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right panel - Selected rules */}
                  <div className="flex flex-col space-y-4 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground-secondary">
                        Selected Rules ({selectedRules.length})
                      </h3>
                      {selectedRules.length > 0 && (
                        <button
                          onClick={() => setSelectedRules([])}
                          className="text-sm text-foreground-muted hover:text-foreground"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {selectedRules.length > 0 ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={selectedRules.map((r) => r._id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="flex-1 space-y-2 overflow-y-auto">
                            {selectedRules.map((rule, index) => (
                              <SortableRuleItem
                                key={rule._id}
                                rule={rule}
                                index={index}
                                onRemove={() => removeRule(rule._id)}
                                onPreview={() => setPreviewRule(rule)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                        <DragOverlay>
                          {activeRule && (
                            <DragOverlayItem rule={activeRule} index={activeIndex} />
                          )}
                        </DragOverlay>
                      </DndContext>
                    ) : (
                      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-12 text-center">
                        <FileText className="mb-2 h-8 w-8 text-foreground-muted" />
                        <p className="text-sm text-foreground-secondary">
                          Select rules from the left panel
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            {project && (
              <div className="flex justify-end gap-3 border-t border-border p-6">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-secondary"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={canSave && !isSaving ? { scale: 1.02 } : {}}
                  whileTap={canSave && !isSaving ? { scale: 0.98 } : {}}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Rule Preview Modal */}
          <RulePreviewModal
            rule={previewRule}
            onClose={() => setPreviewRule(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
