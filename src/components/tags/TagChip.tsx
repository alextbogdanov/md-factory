// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { motion } from 'framer-motion'

// ============================================================================
// ### TYPES ###
// ============================================================================
interface TagChipProps {
  tag: {
    _id: string
    name: string
    color: string
  }
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
  removable?: boolean
  onRemove?: () => void
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
export function TagChip({
  tag,
  selected = false,
  onClick,
  size = 'md',
  removable = false,
  onRemove,
}: TagChipProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove) {
      onRemove()
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all ${sizeClasses[size]} ${
        selected
          ? 'ring-2 ring-accent ring-offset-2 ring-offset-background'
          : ''
      }`}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      {tag.name}
      {removable && (
        <button
          onClick={handleRemove}
          className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10"
        >
          ×
        </button>
      )}
    </motion.button>
  )
}
