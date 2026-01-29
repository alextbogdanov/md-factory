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
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_createdAt')
      .order('desc')
      .collect()

    // Get rule count for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const projectRules = await ctx.db
          .query('projectRules')
          .withIndex('by_projectId', (q) => q.eq('projectId', project._id))
          .collect()

        return {
          ...project,
          ruleCount: projectRules.length,
        }
      })
    )

    return projectsWithCounts
  },
})

export const get = query({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id)
    if (!project) return null

    const projectRules = await ctx.db
      .query('projectRules')
      .withIndex('by_projectId_order', (q) => q.eq('projectId', args.id))
      .collect()

    // Sort by order
    projectRules.sort((a, b) => a.order - b.order)

    const rules = await Promise.all(
      projectRules.map(async (pr) => {
        const rule = await ctx.db.get(pr.ruleId)
        if (!rule) return null

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

    return {
      ...project,
      rules: rules.filter(Boolean),
    }
  },
})

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const allProjects = await ctx.db
      .query('projects')
      .withIndex('by_createdAt')
      .order('desc')
      .collect()

    if (!args.query.trim()) {
      return allProjects
    }

    const lowerQuery = args.query.toLowerCase()
    return allProjects.filter((p) => p.name.toLowerCase().includes(lowerQuery))
  },
})

export const getProjectsUsingRule = query({
  args: { ruleId: v.id('rules') },
  handler: async (ctx, args) => {
    const projectRules = await ctx.db
      .query('projectRules')
      .withIndex('by_ruleId', (q) => q.eq('ruleId', args.ruleId))
      .collect()

    const projects = await Promise.all(
      projectRules.map(async (pr) => await ctx.db.get(pr.projectId))
    )

    return projects.filter(Boolean)
  },
})

// ============================================================================
// ### MUTATIONS ###
// ============================================================================
export const create = mutation({
  args: {
    name: v.string(),
    ruleIds: v.array(v.id('rules')),
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert('projects', {
      name: args.name,
      createdAt: Date.now(),
    })

    // Create projectRules with order
    for (let i = 0; i < args.ruleIds.length; i++) {
      await ctx.db.insert('projectRules', {
        projectId,
        ruleId: args.ruleIds[i],
        order: i,
      })
    }

    return projectId
  },
})

export const update = mutation({
  args: {
    id: v.id('projects'),
    name: v.string(),
    ruleIds: v.array(v.id('rules')),
  },
  handler: async (ctx, args) => {
    // Validate project exists
    const project = await ctx.db.get(args.id)
    if (!project) {
      throw new Error('Project not found')
    }

    // Update project name and timestamp
    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    })

    // Delete existing projectRules
    const existingProjectRules = await ctx.db
      .query('projectRules')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.id))
      .collect()

    for (const pr of existingProjectRules) {
      await ctx.db.delete(pr._id)
    }

    // Insert new projectRules with order
    for (let i = 0; i < args.ruleIds.length; i++) {
      await ctx.db.insert('projectRules', {
        projectId: args.id,
        ruleId: args.ruleIds[i],
        order: i,
      })
    }

    return args.id
  },
})

export const remove = mutation({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    // Remove projectRules
    const projectRules = await ctx.db
      .query('projectRules')
      .withIndex('by_projectId', (q) => q.eq('projectId', args.id))
      .collect()

    for (const pr of projectRules) {
      await ctx.db.delete(pr._id)
    }

    // Delete the project
    await ctx.db.delete(args.id)
  },
})
