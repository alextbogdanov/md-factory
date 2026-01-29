// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// ============================================================================
// ### TYPES ###
// ============================================================================
// Rule with its associated tags
// ============================================================================
// ### QUERIES ###
// ============================================================================
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rules = await ctx.db
      .query('rules')
      .withIndex('by_createdAt')
      .order('desc')
      .collect()

    // Get tags for each rule
    const rulesWithTags = await Promise.all(
      rules.map(async (rule) => {
        const ruleTags = await ctx.db
          .query('ruleTags')
          .withIndex('by_ruleId', (q) => q.eq('ruleId', rule._id))
          .collect()

        const tags = await Promise.all(
          ruleTags.map(async (rt) => await ctx.db.get(rt.tagId))
        )

        return {
          ...rule,
          tags: tags.filter(Boolean),
        }
      })
    )

    return rulesWithTags
  },
})

export const get = query({
  args: { id: v.id('rules') },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.id)
    if (!rule) return null

    const ruleTags = await ctx.db
      .query('ruleTags')
      .withIndex('by_ruleId', (q) => q.eq('ruleId', args.id))
      .collect()

    const tags = await Promise.all(
      ruleTags.map(async (rt) => await ctx.db.get(rt.tagId))
    )

    return {
      ...rule,
      tags: tags.filter(Boolean),
    }
  },
})

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return await ctx.db
        .query('rules')
        .withIndex('by_createdAt')
        .order('desc')
        .collect()
    }

    const results = await ctx.db
      .query('rules')
      .withSearchIndex('search_rules', (q) => q.search('title', args.query))
      .collect()

    return results
  },
})

export const getByTagId = query({
  args: { tagId: v.id('tags') },
  handler: async (ctx, args) => {
    const ruleTags = await ctx.db
      .query('ruleTags')
      .withIndex('by_tagId', (q) => q.eq('tagId', args.tagId))
      .collect()

    const rules = await Promise.all(
      ruleTags.map(async (rt) => await ctx.db.get(rt.ruleId))
    )

    return rules.filter(Boolean)
  },
})

// ============================================================================
// ### MUTATIONS ###
// ============================================================================
export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    tagIds: v.array(v.id('tags')),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const ruleId = await ctx.db.insert('rules', {
      title: args.title,
      body: args.body,
      createdAt: now,
      updatedAt: now,
    })

    // Create ruleTags associations
    for (const tagId of args.tagIds) {
      await ctx.db.insert('ruleTags', {
        ruleId,
        tagId,
      })
    }

    return ruleId
  },
})

export const update = mutation({
  args: {
    id: v.id('rules'),
    title: v.string(),
    body: v.string(),
    tagIds: v.array(v.id('tags')),
  },
  handler: async (ctx, args) => {
    // Update the rule
    await ctx.db.patch(args.id, {
      title: args.title,
      body: args.body,
      updatedAt: Date.now(),
    })

    // Remove existing ruleTags
    const existingRuleTags = await ctx.db
      .query('ruleTags')
      .withIndex('by_ruleId', (q) => q.eq('ruleId', args.id))
      .collect()

    for (const rt of existingRuleTags) {
      await ctx.db.delete(rt._id)
    }

    // Create new ruleTags
    for (const tagId of args.tagIds) {
      await ctx.db.insert('ruleTags', {
        ruleId: args.id,
        tagId,
      })
    }
  },
})

export const remove = mutation({
  args: { id: v.id('rules') },
  handler: async (ctx, args) => {
    // Remove ruleTags
    const ruleTags = await ctx.db
      .query('ruleTags')
      .withIndex('by_ruleId', (q) => q.eq('ruleId', args.id))
      .collect()

    for (const rt of ruleTags) {
      await ctx.db.delete(rt._id)
    }

    // Remove projectRules
    const projectRules = await ctx.db
      .query('projectRules')
      .withIndex('by_ruleId', (q) => q.eq('ruleId', args.id))
      .collect()

    for (const pr of projectRules) {
      await ctx.db.delete(pr._id)
    }

    // Delete the rule
    await ctx.db.delete(args.id)
  },
})

export const createBatch = mutation({
  args: {
    rules: v.array(
      v.object({
        title: v.string(),
        body: v.string(),
        tagIds: v.array(v.id('tags')),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const ruleIds: string[] = []

    for (const rule of args.rules) {
      const ruleId = await ctx.db.insert('rules', {
        title: rule.title,
        body: rule.body,
        createdAt: now,
        updatedAt: now,
      })

      for (const tagId of rule.tagIds) {
        await ctx.db.insert('ruleTags', {
          ruleId,
          tagId,
        })
      }

      ruleIds.push(ruleId)
    }

    return ruleIds
  },
})
