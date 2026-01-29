# MD Factory

A web application for managing reusable CLAUDE.md development rules across multiple projects.

## The Problem

When starting new projects, developers must repeatedly create or copy-paste CLAUDE.md files (Claude development rules), manually modifying them based on each project's tech stack. This leads to:

- **Inconsistency**: Rules scattered across projects with slight variations
- **Duplication**: Same rules rewritten multiple times
- **Poor discoverability**: Hard to find and reuse existing rules
- **Manual maintenance**: No central place to update rules across projects

## The Solution

MD Factory provides a centralized repository for managing, tagging, searching, and generating customized CLAUDE.md files. Key features include:

- **Rule Management**: Create, edit, delete, and search development rules
- **Tag Organization**: Categorize rules with colored tags for easy filtering
- **Batch Import**: Parse existing CLAUDE.md files and import rules automatically
- **Project Generation**: Build customized .md files with drag-and-drop rule ordering
- **Project Tracking**: Keep a record of generated projects and their rule sets

## Get Started

### Prerequisites

- Node.js 18+
- pnpm (package manager)
- A Convex account (free at [convex.dev](https://convex.dev))

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd md-factory
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Deploy Convex Backend (Production)

**Important**: Deploy to production first to ensure your data is persisted and never lost.

```bash
npx convex deploy
```

This will:
- Create a new Convex project (or link to an existing one)
- Deploy your schema and functions to production
- Output your production deployment URL

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
VITE_CONVEX_URL=https://your-deployment-url.convex.cloud
```

Replace `your-deployment-url` with the production URL from step 3.

> **Why production URL?** Using the production deployment URL ensures all your rules and projects are persisted permanently. Development deployments may be reset or deleted.

### 5. Start the Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Alternative: Development Mode with Convex

If you want to run Convex in development mode alongside the app:

```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start Vite dev server
pnpm dev
```

Note: In dev mode, use the development URL in `.env.local`.

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  (React 19 + TypeScript + TailwindCSS + Framer Motion)  │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Convex Backend                        │
│         (Real-time Database + Serverless Functions)     │
└─────────────────────────────────────────────────────────┘
```

### Data Model

**Rules**: Individual development rules with a title and body content.

**Tags**: Categories with names and colors for organizing rules.

**Projects**: Snapshots of generated .md files with ordered rule selections.

**Relationships**:
- Rules ↔ Tags: Many-to-many (a rule can have multiple tags)
- Projects ↔ Rules: Many-to-many with ordering (preserves rule sequence)

### Pages

| Page | Purpose |
|------|---------|
| **Generator** | Build new CLAUDE.md files by selecting and ordering rules |
| **Rules** | Create, edit, search, and filter your rule library |
| **Tags** | Manage tags for organizing rules by category |
| **Projects** | View past projects and regenerate their .md files |

### Workflow

1. **Import or Create Rules**: Start by importing rules from an existing CLAUDE.md file or create them manually
2. **Organize with Tags**: Add tags like "React", "Convex", "TypeScript" to categorize rules
3. **Generate Projects**: Select rules, drag to reorder, and generate a customized .md file
4. **Track & Reuse**: Projects are saved so you can regenerate or use them as templates

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework (with React Compiler for automatic optimization) |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| TailwindCSS | Styling |
| Convex | Backend database and serverless functions |
| Framer Motion | Animations |
| @dnd-kit | Drag and drop functionality |
| React Router | Client-side routing |

## Project Structure

```
md-factory/
├── src/
│   ├── pages/           # Main application pages
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # AppShell, Sidebar, ThemeToggle
│   │   ├── rules/       # Rule cards, modals, import
│   │   ├── tags/        # Tag cards, modals, chips
│   │   ├── generator/   # Builder, sortable items
│   │   ├── projects/    # Project cards
│   │   └── ui/          # Shared UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities (markdown parser)
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Router configuration
│   └── main.tsx         # Application entry point
├── convex/
│   ├── schema.ts        # Database schema
│   ├── rules.ts         # Rule queries and mutations
│   ├── tags.ts          # Tag queries and mutations
│   └── projects.ts      # Project queries and mutations
└── docs/                # Documentation and design files
```

## Features in Detail

### Rule Import

The import feature automatically parses CLAUDE.md files and extracts individual rules. Supported formats:

```markdown
### 1. Rule Title
Rule content...

## 2. Another Rule
More content...

**1. Bold Numbered Rule**
Content here...
```

### Tag Filtering

Filter rules by multiple tags simultaneously. Click a tag chip to toggle it on/off.

### Drag and Drop

In the generator, drag rules to reorder them. The final order is preserved in the generated .md file.

### Dark Mode

Toggle between light and dark themes using the sidebar button. Your preference is saved locally.

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
