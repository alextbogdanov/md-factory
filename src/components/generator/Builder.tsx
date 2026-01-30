// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  Copy,
  FileText,
  FolderOpen,
  Search,
} from 'lucide-react'
import { useState } from 'react'
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
import { SortableRuleItem, DragOverlayItem } from './SortableRuleItem'
import { RulePreviewModal } from '../ui/RulePreviewModal'
import { TagOrderModal } from './TagOrderModal'

// ============================================================================
// ### UTILITIES ###
// ============================================================================
import { generateMarkdown } from '../../lib/parseMarkdown'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Id, Doc } from '../../../convex/_generated/dataModel'

interface BuilderProps {
  onCancel: () => void
}

type Tab = 'rules' | 'projects'
type RuleWithTags = Doc<'rules'> & { tags: (Doc<'tags'> | null)[] }

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function Builder({ onCancel }: BuilderProps) {
  const [activeTab, setActiveTab] = useState<Tab>('rules')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<Id<'tags'>[]>([])
  const [selectedRules, setSelectedRules] = useState<RuleWithTags[]>([])
  const [projectName, setProjectName] = useState('')
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewRule, setPreviewRule] = useState<RuleWithTags | null>(null)
  const [activeId, setActiveId] = useState<Id<'rules'> | null>(null)
  const [tagOrderModalOpen, setTagOrderModalOpen] = useState(false)
  const [tagOrder, setTagOrder] = useState<Id<'tags'>[]>([])  // Current tag priority order

  const rules = useQuery(api.rules.list) ?? []
  const tags = useQuery(api.tags.list) ?? []
  const projects = useQuery(api.projects.list) ?? []

  const createProject = useMutation(api.projects.create)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
    if (selectedRules.some((r) => r._id === rule._id)) return
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

  // Extract unique tags from selected rules
  const selectedRuleTags = (() => {
    const tagMap = new Map<string, { _id: string; name: string; color: string }>()
    selectedRules.forEach((rule) => {
      rule.tags.forEach((tag) => {
        if (tag && !tagMap.has(tag._id)) {
          tagMap.set(tag._id, { _id: tag._id, name: tag.name, color: tag.color })
        }
      })
    })
    return Array.from(tagMap.values())
  })()

  // Handle tag order application - sorts rules by tag priority
  const handleApplyTagOrder = (orderedTagIds: string[]) => {
    setTagOrder(orderedTagIds as Id<'tags'>[])

    // Sort selectedRules by tag priority
    const sortedRules = [...selectedRules].sort((a, b) => {
      // Find the highest priority tag for each rule
      const aPriority = Math.min(
        ...a.tags
          .filter((t): t is NonNullable<typeof t> => t !== null)
          .map((t) => {
            const idx = orderedTagIds.indexOf(t._id)
            return idx === -1 ? Infinity : idx
          }),
        Infinity
      )
      const bPriority = Math.min(
        ...b.tags
          .filter((t): t is NonNullable<typeof t> => t !== null)
          .map((t) => {
            const idx = orderedTagIds.indexOf(t._id)
            return idx === -1 ? Infinity : idx
          }),
        Infinity
      )
      return aPriority - bPriority
    })

    setSelectedRules(sortedRules)
  }

  // Get tag colors for a rule (for colored index indicator)
  const getRuleTagColors = (rule: RuleWithTags): string[] => {
    const colors: string[] = []
    const validTags = rule.tags.filter((t): t is NonNullable<typeof t> => t !== null)

    // If we have a tag order, sort by priority
    if (tagOrder.length > 0) {
      validTags.sort((a, b) => {
        const aIdx = tagOrder.indexOf(a._id as Id<'tags'>)
        const bIdx = tagOrder.indexOf(b._id as Id<'tags'>)
        if (aIdx === -1 && bIdx === -1) return 0
        if (aIdx === -1) return 1
        if (bIdx === -1) return -1
        return aIdx - bIdx
      })
    }

    validTags.forEach((tag) => {
      colors.push(tag.color)
    })
    return colors
  }

  const handleGenerate = async () => {
    if (!projectName.trim() || selectedRules.length === 0) return

    setIsGenerating(true)
    try {
      // Create project in database
      await createProject({
        name: projectName.trim(),
        ruleIds: selectedRules.map((r) => r._id),
      })

      // Generate markdown
      const markdown = generateMarkdown(
        selectedRules.map((r) => ({ title: r.title, body: r.body })),
        projectName.trim()
      )
      setGeneratedMarkdown(markdown)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedMarkdown) return
    await navigator.clipboard.writeText(generatedMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Show output view
  if (generatedMarkdown) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Generated: {projectName}
          </h1>
          <div className="flex gap-2">
            <motion.button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </motion.button>
            <motion.button
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Done
            </motion.button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background-secondary p-6">
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-foreground">
            {generatedMarkdown}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={onCancel}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-secondary hover:text-foreground"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <h1 className="text-2xl font-bold text-foreground">Build CLAUDE.md</h1>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left panel - Rule selection */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-background-secondary p-1">
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'rules'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <FileText className="mr-2 inline-block h-4 w-4" />
              All Rules
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <FolderOpen className="mr-2 inline-block h-4 w-4" />
              From Project
            </button>
          </div>

          {activeTab === 'rules' && (
            <>
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
              <div className="max-h-[50vh] space-y-3 overflow-y-auto">
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
            </>
          )}

          {activeTab === 'projects' && (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              {projects.map((project) => (
                <ProjectImportCard
                  key={project._id}
                  project={project}
                  onImport={(projectRules) => {
                    projectRules.forEach((rule) => {
                      if (!selectedRules.some((r) => r._id === rule._id)) {
                        setSelectedRules((prev) => [...prev, rule])
                      }
                    })
                  }}
                />
              ))}
              {projects.length === 0 && (
                <div className="flex flex-col items-center py-8 text-center">
                  <FolderOpen className="mb-2 h-8 w-8 text-foreground-muted" />
                  <p className="text-sm text-foreground-secondary">
                    No projects yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel - Selected rules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Selected Rules ({selectedRules.length})
            </h2>
            {selectedRules.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedRuleTags.length > 0 && (
                  <motion.button
                    onClick={() => setTagOrderModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-background-secondary px-3 py-1.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-background-tertiary hover:text-foreground"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Order by Tags
                  </motion.button>
                )}
                <button
                  onClick={() => setSelectedRules([])}
                  className="text-sm text-foreground-muted hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
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
                <div className="max-h-[40vh] space-y-2 overflow-y-auto">
                  {selectedRules.map((rule, index) => (
                    <SortableRuleItem
                      key={rule._id}
                      rule={rule}
                      index={index}
                      onRemove={() => removeRule(rule._id)}
                      onPreview={() => setPreviewRule(rule)}
                      tagColors={getRuleTagColors(rule)}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeRule && (
                  <DragOverlayItem
                    rule={activeRule}
                    index={activeIndex}
                    tagColors={getRuleTagColors(activeRule)}
                  />
                )}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-border py-12 text-center">
              <FileText className="mb-2 h-8 w-8 text-foreground-muted" />
              <p className="text-sm text-foreground-secondary">
                Select rules from the left panel
              </p>
            </div>
          )}

          {/* Project name and generate */}
          <div className="space-y-4 border-t border-border pt-4">
            <div>
              <label
                htmlFor="projectName"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                placeholder="e.g., my-mobile-app"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <motion.button
              onClick={handleGenerate}
              disabled={
                !projectName.trim() ||
                selectedRules.length === 0 ||
                isGenerating
              }
              className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isGenerating ? 'Generating...' : 'Generate CLAUDE.md'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Rule Preview Modal */}
      <RulePreviewModal
        rule={previewRule}
        onClose={() => setPreviewRule(null)}
      />

      {/* Tag Order Modal */}
      <TagOrderModal
        open={tagOrderModalOpen}
        onClose={() => setTagOrderModalOpen(false)}
        tags={selectedRuleTags}
        onApply={handleApplyTagOrder}
      />
    </div>
  )
}

// ============================================================================
// ### HELPER COMPONENTS ###
// ============================================================================
interface ProjectImportCardProps {
  project: Doc<'projects'> & { ruleCount: number }
  onImport: (rules: RuleWithTags[]) => void
}

function ProjectImportCard({ project, onImport }: ProjectImportCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const projectDetails = useQuery(api.projects.get, { id: project._id })

  const handleImport = () => {
    if (!projectDetails?.rules) {
      setIsLoading(true)
      return
    }
    onImport(projectDetails.rules as RuleWithTags[])
  }

  // Auto-import when details load after clicking
  if (isLoading && projectDetails?.rules) {
    setIsLoading(false)
    onImport(projectDetails.rules as RuleWithTags[])
  }

  return (
    <motion.div
      className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
      whileHover={{ y: -1 }}
    >
      <div>
        <h3 className="font-medium text-foreground">{project.name}</h3>
        <p className="text-sm text-foreground-muted">
          {project.ruleCount} rule{project.ruleCount !== 1 ? 's' : ''}
        </p>
      </div>
      <motion.button
        onClick={handleImport}
        disabled={isLoading}
        className="rounded-lg bg-background-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-tertiary"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? 'Loading...' : 'Import'}
      </motion.button>
    </motion.div>
  )
}
