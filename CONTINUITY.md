# Continuity Ledger

## Goal
Build MD Factory — a web app to manage reusable CLAUDE.md rules with tagging, search, and project tracking. Internal tool, no auth required.

**Success criteria:**
- CRUD for rules and tags
- Full-text search on rules
- Import CLAUDE.md files (auto-parse) and from existing projects
- Generate .md files with project tracking
- Modern UI with dark/light mode and animations

## Constraints/Assumptions
- Tech: Vite + React + TypeScript + TailwindCSS + Framer Motion + Convex
- No authentication needed
- Join tables for relationships (ruleTags, projectRules)
- Convex full-text search (not vector search)
- Projects are lightweight metadata (no file storage)
- React Compiler enabled for automatic memoization

## Key Decisions
1. Auto-parse imported CLAUDE.md into individual rules (not templates)
2. Lightweight project tracking (metadata only, not full project management)
3. Convex full-text search over vector search
4. 4 sidebar sections: Generator, Rules, Tags, Projects
5. Vite + React (not Next.js — no SSR needed)
6. Both dark and light mode with toggle
7. Join tables instead of array fields for relationships
8. Import from projects adds rules to selection (doesn't replace)
9. React Compiler via babel-plugin-react-compiler
10. TailwindCSS v4 with @theme for CSS variables

## State

### Done
- Phase 1: Foundation (Vite, Convex, Tailwind, AppShell, React Compiler)
- Phase 2: Tags CRUD (TagCard, TagModal, TagChip)
- Phase 3: Rules CRUD + search + import (RuleCard, RuleModal, ImportModal)
- Phase 4: Generator + project creation (Builder with drag-drop)
- Phase 5: Projects page (ProjectCard with expand/copy)
- Phase 6: Animations with Framer Motion
- Phase 7: Project editing (ProjectEditModal with two-panel layout, drag-drop reordering)

### Now
- Completed: Project editing feature

### Next
- Test the project editing feature manually

## Open Questions
- None currently

## Working Set
- `docs/plans/2026-01-29-md-factory-design.md` — Full design document
- `docs/PROMPT.md` — Original prompt
- `convex/schema.ts` — Database schema with indexes
- `src/components/` — All UI components
- `src/pages/` — 4 page components
- `src/lib/parseMarkdown.ts` — Import parser
