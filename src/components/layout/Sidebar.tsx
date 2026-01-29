// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, FolderOpen, Home, Menu, Tag, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import { ThemeToggle } from './ThemeToggle'

// ============================================================================
// ### TYPES ###
// ============================================================================
interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

// ============================================================================
// ### CONSTANTS ###
// ============================================================================
const NAV_ITEMS = [
  { to: '/', icon: <Home className="h-5 w-5" />, label: 'Generator' },
  { to: '/rules', icon: <FileText className="h-5 w-5" />, label: 'Rules' },
  { to: '/tags', icon: <Tag className="h-5 w-5" />, label: 'Tags' },
  { to: '/projects', icon: <FolderOpen className="h-5 w-5" />, label: 'Projects' },
]

// ============================================================================
// ### CUSTOM ###
// ============================================================================
function NavItem({ to, icon, label, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-sidebar-active text-foreground'
            : 'text-foreground-secondary hover:bg-sidebar-hover hover:text-foreground'
        }`
      }
    >
      {({ isActive }) => (
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.15 }}
        >
          <span className={isActive ? 'text-accent' : ''}>{icon}</span>
          <span>{label}</span>
        </motion.div>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-foreground-secondary shadow-lg transition-colors hover:bg-sidebar-hover hover:text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: mobileOpen ? 0 : undefined,
        }}
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-sidebar md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform md:transition-none`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              MD Factory
            </span>
          </div>
          <button
            onClick={closeMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-secondary hover:bg-sidebar-hover hover:text-foreground md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} onClick={closeMobile} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground-muted">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </motion.aside>
    </>
  )
}
