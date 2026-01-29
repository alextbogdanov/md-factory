// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// ============================================================================
// ### CONFIGURATIONS ###
// ============================================================================
export default defineSchema({
  // Rules table - stores individual CLAUDE.md rules
  rules: defineTable({
    title: v.string(),
    body: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_createdAt', ['createdAt'])
    .index('by_updatedAt', ['updatedAt'])
    .searchIndex('search_rules', {
      searchField: 'title',
      filterFields: [],
    }),

  // Tags table - categorizes rules
  tags: defineTable({
    name: v.string(),
    color: v.string(),
  }).index('by_name', ['name']),

  // RuleTags join table - many-to-many relationship between rules and tags
  ruleTags: defineTable({
    ruleId: v.id('rules'),
    tagId: v.id('tags'),
  })
    .index('by_ruleId', ['ruleId'])
    .index('by_tagId', ['tagId'])
    .index('by_ruleId_tagId', ['ruleId', 'tagId']),

  // Projects table - tracks generated .md files
  projects: defineTable({
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_createdAt', ['createdAt'])
    .index('by_name', ['name']),

  // ProjectRules join table - tracks which rules are in each project
  projectRules: defineTable({
    projectId: v.id('projects'),
    ruleId: v.id('rules'),
    order: v.number(),
  })
    .index('by_projectId', ['projectId'])
    .index('by_ruleId', ['ruleId'])
    .index('by_projectId_order', ['projectId', 'order']),
})
