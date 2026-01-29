# Claude Development Rules

Use all available skills and plugins that are relevant when working on a task.
Search for skills and plugins if you don't know what to use.

## Development Guidelines

### 3. Code Section Organization
When writing code, separate different sections with comments like this:

```javascript
// ============================================================================
// ### IMPORTS ###
// ============================================================================
```

Sections should be in this order:
1. **imports** (all imported libraries)
2. **convex** (all imports from the convex @_generated folder)
3. **stores** (all imports of data stores like zustand)
4. **hooks** (all imports of hooks)
5. **components** (non-library components)
6. **utilities** (all imports of utility functions but not from libraries)
7. **helpers** (all imports of helper files)
8. **types** (all type imports and definitions)
9. **constants** (all constant imports and definitions)
10. **assets** (all imports of images, fonts, css files, etc)
11. **configurations** (custom configuration code)
12. **custom** (everything else)

### 4. Convex Queries with Indexes
When using convex queries, all fetching from tables should be done using an index. Create a new index if necessary.

### 5. React Compiler Best Practices
We should always be using and enabling the newly announced react compiler. Follow the documentation thoroughly:
https://react.dev/blog/2025/10/07/react-compiler-1

Follow best practices and avoid memoization unless there's a really good reason.

### 8. Styling with TailwindCSS
Use tailwindcss whenever possible. Only use `stylesheet` or `style={{}}` when a component doesn't support tailwindcss styling (usually non-react-native components).

### 12. Code Quality Review
After implementing a feature/changes/bug fix, always review your code and check for:
- Unused code
- Unused components  
- AI slop in general

Remove any such code to ensure the codebase is production-ready and meets the highest quality standards.

Additionally, run checks such as `tsc` (if working on a typescript project) to ensure that there no errors.

### 13. Mobile-First Web Development
When working on a web app, ensure the mobile version never sacrifices functionality. All buttons and menu options should be present. Get creative with solutions like:
- Implementing a sidebar for menu options
- Bottom navbar with tabs

### 14. Minimize useEffect Usage
When using `useEffect`, always stop and read this article first:
https://react.dev/learn/you-might-not-need-an-effect

Then after reading it decide if you still need a useEffect. Overall, try to avoid `useEffect` hooks as much as possible in React.

### 15. State Management Best Practices
When dealing with state in React, always check if you really need `useState` or if you can use derived state instead. Refer to these guides:
- https://dev.to/brunohenrique00/react-we-need-to-talk-about-derived-states-3ljp
- https://medium.com/@jaswanth_270602/mastering-derived-state-with-usestate-reactjs-series-part-20-e5d1404115bc

### 16. Documenting features
When working on a complex system / feature always create a .md file describing what the desired effect is, what's been done so far, how everything works, what's left to do and what are potential improvements / security issues. E.g. for a subscription system you'd create a SUBSCRIPTION.md in /docs folder


### 17. Continuity ledger
## Continuity Ledger (compaction-safe)
Maintain a single Continuity Ledger for this workspace in `CONTINUITY.md`. The ledger is the canonical session briefing designed to survive context compaction; do not rely on earlier chat text unless it’s reflected in the ledger.

### How it works
- At the start of every assistant turn: read `CONTINUITY.md`, update it to reflect the latest goal/constraints/decisions/state, then proceed with the work.
- Update `CONTINUITY.md` again whenever any of these change: goal, constraints/assumptions, key decisions, progress state (Done/Now/Next), or important tool outcomes.
- Keep it short and stable: facts only, no transcripts. Prefer bullets. Mark uncertainty as `UNCONFIRMED` (never guess).
- If you notice missing recall or a compaction/summary event: refresh/rebuild the ledger from visible context, mark gaps `UNCONFIRMED`, ask up to 1–3 targeted questions, then continue.

### `functions.update_plan` vs the Ledger
- `functions.update_plan` is for short-term execution scaffolding while you work (a small 3–7 step plan with pending/in_progress/completed).
- `CONTINUITY.md` is for long-running continuity across compaction (the “what/why/current state”), not a step-by-step task list.
- Keep them consistent: when the plan or state changes, update the ledger at the intent/progress level (not every micro-step).

### In replies
- Begin with a brief “Ledger Snapshot” (Goal + Now/Next + Open Questions). Print the full ledger only when it materially changes or when the user asks.

### `CONTINUITY.md` format (keep headings)
- Goal (incl. success criteria):
- Constraints/Assumptions:
- Key decisions:
- State:
- Done:
- Now:
- Next:
- Open questions (UNCONFIRMED if needed):
- Working set (files/ids/commands):

### 18. Package Manager
Always use pnpm as the package manager instead of npm or yarn. Use pnpm commands for all package operations:
- `pnpm install` - install dependencies
- `pnpm add <package>` - add a new package
- `pnpm add -D <package>` - add a dev dependency
- `pnpm remove <package>` - remove a package
- `pnpm dev` / `pnpm start` - run development server
- `pnpm build` - build the project
- `pnpm dlx` - execute a package (equivalent to npx)