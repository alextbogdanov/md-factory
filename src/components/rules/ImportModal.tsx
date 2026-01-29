// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion } from 'framer-motion'
import { FileUp, Upload, X } from 'lucide-react'
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
// ### UTILITIES ###
// ============================================================================
import { parseMarkdownRules } from '../../lib/parseMarkdown'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Id } from '../../../convex/_generated/dataModel'

interface ImportModalProps {
  onClose: () => void
}

interface ParsedRule {
  title: string
  body: string
  selected: boolean
  tagIds: Id<'tags'>[]
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function ImportModal({ onClose }: ImportModalProps) {
  const [content, setContent] = useState('')
  const [parsedRules, setParsedRules] = useState<ParsedRule[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [step, setStep] = useState<'input' | 'preview'>('input')

  const tags = useQuery(api.tags.list) ?? []
  const createBatch = useMutation(api.rules.createBatch)

  const handleParse = () => {
    setIsParsing(true)
    try {
      const rules = parseMarkdownRules(content)
      setParsedRules(
        rules.map((r) => ({
          ...r,
          selected: true,
          tagIds: [],
        }))
      )
      setStep('preview')
    } finally {
      setIsParsing(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        setContent(text)
      }
    }
    reader.readAsText(file)
  }

  const toggleRuleSelection = (index: number) => {
    setParsedRules((prev) =>
      prev.map((rule, i) =>
        i === index ? { ...rule, selected: !rule.selected } : rule
      )
    )
  }

  const toggleAllRules = (selected: boolean) => {
    setParsedRules((prev) => prev.map((rule) => ({ ...rule, selected })))
  }

  const updateRuleTitle = (index: number, title: string) => {
    setParsedRules((prev) =>
      prev.map((rule, i) => (i === index ? { ...rule, title } : rule))
    )
  }

  const toggleRuleTag = (ruleIndex: number, tagId: Id<'tags'>) => {
    setParsedRules((prev) =>
      prev.map((rule, i) =>
        i === ruleIndex
          ? {
              ...rule,
              tagIds: rule.tagIds.includes(tagId)
                ? rule.tagIds.filter((id) => id !== tagId)
                : [...rule.tagIds, tagId],
            }
          : rule
      )
    )
  }

  const handleImport = async () => {
    const selectedRules = parsedRules.filter((r) => r.selected)
    if (selectedRules.length === 0) return

    setIsImporting(true)
    try {
      await createBatch({
        rules: selectedRules.map((r) => ({
          title: r.title,
          body: r.body,
          tagIds: r.tagIds,
        })),
      })
      onClose()
    } finally {
      setIsImporting(false)
    }
  }

  const selectedCount = parsedRules.filter((r) => r.selected).length

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
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-background shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Import CLAUDE.md
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'input' ? (
            <div className="space-y-4">
              <p className="text-sm text-foreground-secondary">
                Paste your CLAUDE.md content below or upload a file. Rules will
                be automatically detected based on numbered headings.
              </p>

              {/* File upload */}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background-secondary p-6 transition-colors hover:border-accent hover:bg-accent/5">
                <Upload className="h-5 w-5 text-foreground-muted" />
                <span className="text-sm font-medium text-foreground-secondary">
                  Upload .md file
                </span>
                <input
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 border-t border-border" />
                <div className="relative flex justify-center">
                  <span className="bg-background px-4 text-sm text-foreground-muted">
                    or paste content
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                placeholder="Paste your CLAUDE.md content here..."
                rows={12}
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                onChange={(e) => setContent(e.target.value)}
                defaultValue={content}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selection controls */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground-secondary">
                  {parsedRules.length} rules detected, {selectedCount} selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllRules(true)}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Select all
                  </button>
                  <span className="text-foreground-muted">|</span>
                  <button
                    onClick={() => toggleAllRules(false)}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Deselect all
                  </button>
                </div>
              </div>

              {/* Rules list */}
              <div className="space-y-3">
                {parsedRules.map((rule, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 transition-colors ${
                      rule.selected
                        ? 'border-accent bg-accent/5'
                        : 'border-border bg-background-secondary'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleRuleSelection(index)}
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                          rule.selected
                            ? 'border-accent bg-accent text-white'
                            : 'border-border-strong bg-background'
                        }`}
                      >
                        {rule.selected && (
                          <svg className="h-3 w-3" viewBox="0 0 12 12">
                            <path
                              fill="currentColor"
                              d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06L4.25 7.19l4.97-4.97a.75.75 0 0 1 1.06.06Z"
                            />
                          </svg>
                        )}
                      </button>

                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Title input */}
                        <input
                          type="text"
                          className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 font-medium text-foreground focus:border-border focus:bg-background focus:outline-none"
                          onChange={(e) =>
                            updateRuleTitle(index, e.target.value)
                          }
                          defaultValue={rule.title}
                        />

                        {/* Body preview */}
                        <p className="line-clamp-2 break-all text-sm text-foreground-secondary">
                          {rule.body.slice(0, 200)}
                          {rule.body.length > 200 ? '...' : ''}
                        </p>

                        {/* Tags */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                              <TagChip
                                key={tag._id}
                                tag={tag}
                                size="sm"
                                selected={rule.tagIds.includes(tag._id)}
                                onClick={() => toggleRuleTag(index, tag._id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {parsedRules.length === 0 && (
                <div className="flex flex-col items-center py-8 text-center">
                  <FileUp className="mb-3 h-10 w-10 text-foreground-muted" />
                  <p className="text-foreground-secondary">
                    No rules detected. Make sure your content uses numbered
                    headings (e.g., "### 1. Title").
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 border-t border-border p-6">
          {step === 'preview' && (
            <button
              onClick={() => setStep('input')}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-secondary hover:bg-background-secondary"
            >
              Back
            </button>
          )}
          <div className="ml-auto flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground-secondary hover:bg-background-secondary"
            >
              Cancel
            </button>
            {step === 'input' ? (
              <button
                onClick={handleParse}
                disabled={!content.trim() || isParsing}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isParsing ? 'Parsing...' : 'Parse Content'}
              </button>
            ) : (
              <button
                onClick={handleImport}
                disabled={selectedCount === 0 || isImporting}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isImporting
                  ? 'Importing...'
                  : `Import ${selectedCount} Rule${selectedCount !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
