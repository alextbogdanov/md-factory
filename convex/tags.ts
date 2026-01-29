// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// ============================================================================
// ### QUERIES ###
// ============================================================================
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('tags').withIndex('by_name').collect()
  },
})

export const get = query({
  args: { id: v.id('tags') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tags')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first()
  },
})

// ============================================================================
// ### MUTATIONS ###
// ============================================================================
export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('tags', {
      name: args.name,
      color: args.color,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('tags'),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      color: args.color,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('tags') },
  handler: async (ctx, args) => {
    // First remove all ruleTags associations
    const ruleTags = await ctx.db
      .query('ruleTags')
      .withIndex('by_tagId', (q) => q.eq('tagId', args.id))
      .collect()

    for (const ruleTag of ruleTags) {
      await ctx.db.delete(ruleTag._id)
    }

    // Then delete the tag
    await ctx.db.delete(args.id)
  },
})

// ============================================================================
// ### HELPERS ###
// ============================================================================
export const getRuleCount = query({
  args: { tagId: v.id('tags') },
  handler: async (ctx, args) => {
    const ruleTags = await ctx.db
      .query('ruleTags')
      .withIndex('by_tagId', (q) => q.eq('tagId', args.tagId))
      .collect()
    return ruleTags.length
  },
})
