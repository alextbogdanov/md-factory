// ============================================================================
// ### TYPES ###
// ============================================================================
interface ParsedRule {
  title: string
  body: string
}

// ============================================================================
// ### CUSTOM ###
// ============================================================================
/**
 * Parses a CLAUDE.md file content into individual rules.
 * Supports various numbered heading formats:
 * - ### 1. Title Here
 * - ### 1) Title Here
 * - ## 1. Title Here
 * - **1. Title Here**
 */
export function parseMarkdownRules(content: string): ParsedRule[] {
  const rules: ParsedRule[] = []

  // Regex to match numbered headings
  // Matches patterns like:
  // ### 1. Title
  // ## 1. Title
  // ### 1) Title
  // **1. Title**
  const headingPattern =
    /^(?:#{2,3}\s*)?(?:\*\*)?(\d+)[.)]\s*(.+?)(?:\*\*)?$/gm

  // Find all code block ranges to exclude from parsing
  const codeBlockRanges: Array<{ start: number; end: number }> = []
  const codeBlockPattern = /```[\s\S]*?```/g
  let codeMatch
  while ((codeMatch = codeBlockPattern.exec(content)) !== null) {
    codeBlockRanges.push({
      start: codeMatch.index,
      end: codeMatch.index + codeMatch[0].length,
    })
  }

  const isInCodeBlock = (index: number): boolean => {
    return codeBlockRanges.some(
      (range) => index >= range.start && index < range.end
    )
  }

  // Find all heading positions
  const headings: Array<{
    index: number
    number: string
    title: string
    fullMatch: string
  }> = []

  let match
  while ((match = headingPattern.exec(content)) !== null) {
    if (!isInCodeBlock(match.index)) {
      headings.push({
        index: match.index,
        number: match[1],
        title: match[2].trim(),
        fullMatch: match[0],
      })
    }
  }

  // Extract rules from headings
  for (let i = 0; i < headings.length; i++) {
    const current = headings[i]
    const next = headings[i + 1]

    const bodyStart = current.index + current.fullMatch.length
    const bodyEnd = next ? next.index : content.length

    let body = content.slice(bodyStart, bodyEnd).trim()

    // Remove leading newlines
    body = body.replace(/^\n+/, '')

    // Skip if body is empty
    if (body.length === 0) continue

    rules.push({
      title: current.title,
      body,
    })
  }

  return rules
}

/**
 * Generates a CLAUDE.md file from a list of rules.
 */
export function generateMarkdown(
  rules: Array<{ title: string; body: string }>,
  projectName?: string
): string {
  const lines: string[] = []

  if (projectName) {
    lines.push(`# ${projectName}`)
    lines.push('')
  }

  lines.push('# Claude Development Rules')
  lines.push('')

  rules.forEach((rule, index) => {
    lines.push(`### ${index + 1}. ${rule.title}`)
    lines.push(rule.body)
    lines.push('')
  })

  return lines.join('\n').trim()
}
