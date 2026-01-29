// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from 'convex/react'

// ============================================================================
// ### CONVEX ###
// ============================================================================
import { api } from '../../convex/_generated/api'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import { ProjectCard } from '../components/projects/ProjectCard'
import { ProjectEditModal } from '../components/projects/ProjectEditModal'

// ============================================================================
// ### TYPES ###
// ============================================================================
import type { Id } from '../../convex/_generated/dataModel'

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProjectId, setEditingProjectId] = useState<Id<'projects'> | null>(null)

  const projects = useQuery(api.projects.list) ?? []

  const filteredProjects = projects.filter(
    (project) =>
      !searchQuery ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Projects list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={() => setEditingProjectId(project._id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <ProjectEditModal
        projectId={editingProjectId}
        onClose={() => setEditingProjectId(null)}
      />

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-secondary">
            <FolderOpen className="h-6 w-6 text-foreground-muted" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-foreground">
            No projects found
          </h3>
          <p className="text-sm text-foreground-secondary">
            {projects.length === 0
              ? 'Generate your first CLAUDE.md to create a project'
              : 'Try adjusting your search'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
