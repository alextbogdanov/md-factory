# MD Factory — Design Document

## Original Problem Statement

For each new project that I start I have to create a CLAUDE.md. I generally end up reusing the .md files from other projects but they differ depending on the tech stack. I end up copying and pasting and gluing things together.

## Vision

A web application to manage reusable CLAUDE.md rules with tagging, search, and project tracking. Select rules, generate a .md file, and track which projects use which rules.

---

## Core Requirements

- Manage rules (create/edit/delete) with title and body
- Manage tags (create/edit/delete) with name and color
- Assign multiple tags to each rule
- Search rules by title, body, and tags (Convex full-text search)
- Filter/group rules by tags
- Import external CLAUDE.md files and auto-parse into individual rules
- Import rules from existing projects
- Generate .md files by selecting rules
- Track which projects use which rules (lightweight metadata only)
- No authentication (internal tool)
- Modern, simple design with animations
- Dark and light mode with toggle

---

## Tech Stack

- **Frontend:** Vite + React + TypeScript
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Database:** Convex
- **Search:** Convex full-text search
- **Deployment:** Vercel (or local)

---

## Data Model (Convex)

### Tables

**`rules`**
| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated |
| `title` | String | Rule title (e.g., "React Native TextInput") |
| `body` | String | Markdown content |
| `createdAt` | Number | Timestamp |
| `updatedAt` | Number | Timestamp |

**`tags`**
| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated |
| `name` | String | Tag name (e.g., "React Native") |
| `color` | String | Hex color for UI display |

**`ruleTags`** (join table)
| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated |
| `ruleId` | Id | Reference to rule |
| `tagId` | Id | Reference to tag |

**`projects`**
| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated |
| `name` | String | Project name (e.g., "my-mobile-app") |
| `createdAt` | Number | Timestamp |

**`projectRules`** (join table)
| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated |
| `projectId` | Id | Reference to project |
| `ruleId` | Id | Reference to rule |
| `order` | Number | Display order in generated .md |

### Indexes

- `ruleTags` by `ruleId` — Get all tags for a rule
- `ruleTags` by `tagId` — Get all rules with a tag
- `projectRules` by `projectId` — Get all rules in a project
- `projectRules` by `ruleId` — Get all projects using a rule
- Full-text search index on `rules` (title + body)

---

## UI Structure

### App Shell

- Fixed sidebar on left (collapsible on mobile)
- Main content area on right
- Theme toggle in sidebar footer (sun/moon icon)

### Sidebar Sections

1. **Generator** (home icon) — Default landing page
2. **Rules** (list icon) — Rule management
3. **Tags** (tag icon) — Tag management
4. **Projects** (folder icon) — Project history

---

## Page Designs

### Generator Page (Landing)

**Default state:**
- Large "Create New .md" button

**Builder view (after clicking button):**
- Split layout:
  - **Left panel:** Rule source with three tabs
    - "All Rules" — Search bar + scrollable rule list (grouped by tags, filterable)
    - "From Project" — List of past projects to import from
    - "From File" — Opens paste/upload modal for external CLAUDE.md
  - **Right panel:** "Selected Rules"
    - Shows rules added to current generation
    - Drag-and-drop reorderable
    - Each rule has "−" button to remove
- **Bottom bar:**
  - "Project name" input field
  - "Generate" button

**After generating:**
- Creates project record in database
- Shows final markdown output
- "Copy to Clipboard" button

**Import from project behavior:**
- Selecting a project adds all its rules to current selection
- Duplicates are skipped
- Can still add/remove individual rules after importing

---

### Rules Page

**Layout:**
- Top bar: Search input + "Import .md" button + "New Rule" button
- Below search: Horizontal tag filter chips (multi-select toggle)
- Main area: Grid/list of rule cards

**Rule Card:**
- Title (bold)
- Body preview (first 2-3 lines, truncated)
- Tag chips at bottom
- Click → opens edit modal
- Hover reveals delete icon (with confirmation)

**New/Edit Rule Modal:**
- Title input
- Body textarea (markdown)
- Tag selector (multi-select dropdown, can create new tags inline)
- Save / Cancel buttons

**Import Modal:**
- Textarea to paste content OR file upload button
- "Parse" button → shows preview of detected rules
- Each detected rule: checkbox + editable title + body preview
- "Import Selected" creates rules in batch

---

### Tags Page

**Layout:**
- Top bar: Search input + "New Tag" button
- Main area: Grid of tag cards

**Tag Card:**
- Color dot + tag name
- Counter: "X rules"
- Click → opens edit modal
- Hover reveals delete icon

**Delete behavior:**
- Confirmation if tag is used: "This tag is used by X rules. Remove from all and delete?"
- Deleting removes all `ruleTags` entries, then deletes tag

**New/Edit Tag Modal:**
- Name input
- Color picker (preset palette of 8-10 colors)
- Save / Cancel

---

### Projects Page

**Layout:**
- Top bar: Search input (searches project names)
- Main area: List of project cards (newest first)

**Project Card:**
- Project name + creation date
- "X rules" counter
- Click → expands to show rule titles
- Actions: "Copy .md" (regenerates), "Delete" (with confirmation)

**No edit functionality** — Projects are snapshots. Create a new project for different rule sets.

---

## Import Parsing Logic

**Supported formats for auto-detection:**
- `### 1. Title Here`
- `### 1) Title Here`
- `## 1. Title Here`
- `**1. Title Here**`

**Algorithm:**
1. Split content by regex matching numbered heading patterns
2. Extract title from heading line
3. Body = content until next numbered heading (or EOF)
4. Trim whitespace
5. Skip empty sections

**Edge cases:**
- Intro text before rule 1 → Ignored or shown as discardable
- Nested numbering (1.a, 1.b) → Kept in parent rule's body
- Code blocks with numbers → Regex skips content in triple backticks

**Preview UI:**
- Show detected rules with checkboxes
- Allow inline editing of title/body before import
- "Import Selected" creates rules in batch

---

## Animations (Framer Motion)

- Sidebar items: hover scale + background transition
- Rule/tag cards: fade-in on load, scale on hover
- Adding/removing rules in builder: smooth height transitions
- Page transitions: fade + slight slide
- Modals: fade + scale in/out
- Theme toggle: smooth color transitions

---

## Theme System

- Dark mode and light mode
- System preference detection on first load
- Manual toggle (persisted to localStorage)
- CSS variables for colors, Tailwind dark: variant

---

## File Structure (Proposed)

```
md-factory/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AppShell.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── rules/
│   │   │   ├── RuleCard.tsx
│   │   │   ├── RuleModal.tsx
│   │   │   ├── RuleList.tsx
│   │   │   └── ImportModal.tsx
│   │   ├── tags/
│   │   │   ├── TagCard.tsx
│   │   │   ├── TagModal.tsx
│   │   │   └── TagChip.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   └── ProjectList.tsx
│   │   ├── generator/
│   │   │   ├── Builder.tsx
│   │   │   ├── RuleSelector.tsx
│   │   │   ├── SelectedRules.tsx
│   │   │   └── OutputPreview.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── SearchInput.tsx
│   │       └── ConfirmDialog.tsx
│   ├── pages/
│   │   ├── GeneratorPage.tsx
│   │   ├── RulesPage.tsx
│   │   ├── TagsPage.tsx
│   │   └── ProjectsPage.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   └── useSearch.ts
│   ├── lib/
│   │   ├── parseMarkdown.ts
│   │   └── generateMarkdown.ts
│   ├── api/
│   │   ├── useCreateRule.ts
│   │   ├── useUpdateRule.ts
│   │   ├── useDeleteRule.ts
│   │   ├── useCreateTag.ts
│   │   ├── useUpdateTag.ts
│   │   ├── useDeleteTag.ts
│   │   ├── useCreateProject.ts
│   │   └── useDeleteProject.ts
│   ├── types/
│   │   └── convex.d.ts
│   ├── App.tsx
│   └── main.tsx
├── convex/
│   ├── schema.ts
│   ├── rules.ts
│   ├── tags.ts
│   ├── ruleTags.ts
│   ├── projects.ts
│   └── projectRules.ts
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Implementation Order

### Phase 1: Foundation
1. Initialize Vite + React + TypeScript project
2. Set up Convex
3. Set up TailwindCSS + dark mode
4. Create Convex schema (all tables + indexes)
5. Build AppShell + Sidebar + routing

### Phase 2: Tags (simplest CRUD)
1. Tags table queries/mutations
2. TagsPage with list view
3. Tag create/edit/delete modals

### Phase 3: Rules
1. Rules table queries/mutations
2. RulesPage with search + tag filtering
3. Rule create/edit/delete modals
4. Full-text search implementation
5. Import modal with parser

### Phase 4: Generator
1. Builder component with rule selection
2. "From Project" import tab
3. Project creation on generate
4. Markdown generation + copy

### Phase 5: Projects
1. Projects + projectRules queries
2. ProjectsPage with list
3. Expand to view rules, copy .md, delete

### Phase 6: Polish
1. Framer Motion animations
2. Mobile responsive sidebar
3. Theme toggle persistence
4. Loading states + error handling
5. Empty states

---

## Success Criteria

- Can create/edit/delete rules with tags
- Can create/edit/delete tags
- Can search rules by text in title/body
- Can filter rules by tags
- Can import CLAUDE.md and auto-parse into rules
- Can import rules from existing projects
- Can select rules and generate .md with project name
- Can view projects and see which rules they contain
- Can see which projects use each rule
- Dark/light mode works
- Animations feel smooth
- Works on mobile (responsive sidebar)
