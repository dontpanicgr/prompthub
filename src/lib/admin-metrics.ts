import { supabase } from './supabase'

export interface AdminMetrics {
  totalPrompts: number
  totalUsers: number
  totalLikes: number
  totalComments: number
  totalBookmarks: number
  totalProjects: number
  promptsToday: number
  usersToday: number
  likesToday: number
  commentsToday: number
  bookmarksToday: number
  projectsToday: number
  topPrompt: string
  topUser: string
  growthRate: number
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  try {
    // Get today's date for filtering
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Fetch all metrics in parallel
    const [
      promptsResult,
      usersResult,
      likesResult,
      commentsResult,
      bookmarksResult,
      projectsResult,
      promptsTodayResult,
      usersTodayResult,
      likesTodayResult,
      commentsTodayResult,
      bookmarksTodayResult,
      projectsTodayResult,
      topPromptResult,
      topUserResult
    ] = await Promise.all([
      // Total counts
      supabase.from('prompts').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('likes').select('id', { count: 'exact', head: true }),
      supabase.from('comments').select('id', { count: 'exact', head: true }),
      supabase.from('bookmarks').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      
      // Today's counts
      supabase.from('prompts').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString()),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString()),
      supabase.from('likes').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString()),
      supabase.from('comments').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString()),
      supabase.from('bookmarks').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString()),
      supabase.from('projects').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString()),
      
      // Top content
      supabase.from('prompts')
        .select('title, likes_count')
        .order('likes_count', { ascending: false })
        .limit(1)
        .single(),
      supabase.from('profiles')
        .select('name, prompts_count')
        .order('prompts_count', { ascending: false })
        .limit(1)
        .single()
    ])

    // Calculate growth rate (simplified - comparing this month to last month)
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1)

    const [thisMonthPrompts, lastMonthPrompts] = await Promise.all([
      supabase.from('prompts').select('id', { count: 'exact', head: true })
        .gte('created_at', thisMonthStart.toISOString()),
      supabase.from('prompts').select('id', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', lastMonthEnd.toISOString())
    ])

    const thisMonthCount = thisMonthPrompts.count || 0
    const lastMonthCount = lastMonthPrompts.count || 0
    const growthRate = lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0

    return {
      totalPrompts: promptsResult.count || 0,
      totalUsers: usersResult.count || 0,
      totalLikes: likesResult.count || 0,
      totalComments: commentsResult.count || 0,
      totalBookmarks: bookmarksResult.count || 0,
      totalProjects: projectsResult.count || 0,
      promptsToday: promptsTodayResult.count || 0,
      usersToday: usersTodayResult.count || 0,
      likesToday: likesTodayResult.count || 0,
      commentsToday: commentsTodayResult.count || 0,
      bookmarksToday: bookmarksTodayResult.count || 0,
      projectsToday: projectsTodayResult.count || 0,
      topPrompt: topPromptResult.data?.title || 'No prompts yet',
      topUser: topUserResult.data?.name || 'No users yet',
      growthRate: Math.round(growthRate * 10) / 10
    }
  } catch (error) {
    console.error('Error fetching admin metrics:', error)
    // Return default values on error
    return {
      totalPrompts: 0,
      totalUsers: 0,
      totalLikes: 0,
      totalComments: 0,
      totalBookmarks: 0,
      totalProjects: 0,
      promptsToday: 0,
      usersToday: 0,
      likesToday: 0,
      commentsToday: 0,
      bookmarksToday: 0,
      projectsToday: 0,
      topPrompt: 'Error loading data',
      topUser: 'Error loading data',
      growthRate: 0
    }
  }
}
