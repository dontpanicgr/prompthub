import { supabase } from './supabase'
import { logger } from './utils'

// Test database connection and table existence
export async function testDatabaseConnection() {
  try {
    logger.debug('Testing database connection...')
    
    // Test 1: Basic Supabase health check using a public table
    logger.debug('Test 1: Basic health check (profiles)...')
    const { data: healthData, error: healthError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    logger.debug('Health check result (profiles):', { data: !!healthData, error: !!healthError })
    
    // Test 2: Try to access profiles table
    logger.debug('Test 2: Accessing profiles table...')
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    logger.debug('Profiles table result:', { data: !!profilesData, error: !!profilesError })
    
    if (profilesError) {
      logger.error('Profiles table error:', profilesError)
    } else {
      logger.debug('Profiles table accessible')
    }
    
    // Test 3: Try to access prompts table
    logger.debug('Test 3: Accessing prompts table...')
    const { data: promptsData, error: promptsError } = await supabase
      .from('prompts')
      .select('id')
      .limit(1)
    
    logger.debug('Prompts table result:', { data: !!promptsData, error: !!promptsError })
    
    if (promptsError) {
      logger.error('Prompts table error:', promptsError)
    } else {
      logger.debug('Prompts table accessible')
    }
    
    // If we can access at least one table, consider it a success
    const hasAccess = !profilesError || !promptsError
    logger.debug('Database connection test result:', hasAccess)
    return hasAccess
    
  } catch (error) {
    logger.error('Database test exception:', error)
    return false
  }
}

export interface Prompt {
  id: string
  title: string
  body: string
  model: string
  creator_id: string
  is_public: boolean
  project_id?: string | null
  created_at: string
  updated_at: string
  creator: {
    id: string
    name: string
    avatar_url?: string
  }
  project?: Project | null
  like_count: number
  bookmark_count: number
  is_liked?: boolean
  is_bookmarked?: boolean
  categories?: Category[]
}

export interface Category {
  id: string
  slug: string
  name: string
  description?: string | null
  icon?: string | null
  color?: string | null
  sort_order?: number | null
}

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string | null
  color?: string | null
  sort_order: number
  created_at: string
  updated_at: string
  prompt_count?: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  bio?: string
  website_url?: string
  created_at: string
  updated_at: string
}

export interface LeaderboardCreator {
  creator: {
    id: string
    name: string
    avatar_url?: string | null
  }
  likes: number
  bookmarks: number
  promptsCreated: number
  joinedAt?: string | null
}

export interface Comment {
  id: string
  prompt_id: string
  user_id: string
  content: string
  parent_id?: string
  created_at: string
  updated_at: string
  is_deleted: boolean
  user: {
    id: string
    name: string
    avatar_url?: string
  }
  replies?: Comment[]
}

// Check if we're online before making requests
function checkOnlineStatus(): boolean {
  // Allow disabling the offline checker for debugging via env flag
  if (process.env.NEXT_PUBLIC_DISABLE_OFFLINE_CHECKER === 'true') return true
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

// Get all public prompts - OPTIMIZED VERSION
export async function getPublicPrompts(userId?: string): Promise<Prompt[]> {
  try {
    // Check if we're online
    if (!checkOnlineStatus()) {
      logger.warn('⚠️ [getPublicPrompts] Offline - skipping request')
      return []
    }

    logger.debug('🔍 [getPublicPrompts] Starting optimized fetch...')
    
    // Single optimized query with all data in one go
    const { data: promptsWithData, error: queryError } = await supabase
      .from('prompts')
      .select(`
        *,
        creator:profiles!prompts_creator_id_fkey(id, name, avatar_url, is_private),
        prompt_categories(
          category:categories(id, slug, name, description, icon, color, sort_order)
        ),
        likes(count),
        bookmarks(count)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50) // Limit to 50 prompts for better performance

    if (queryError) {
      logger.error('❌ [getPublicPrompts] Error fetching prompts:', queryError)
      return []
    }

    if (!promptsWithData || promptsWithData.length === 0) {
      logger.debug('⚠️ [getPublicPrompts] No prompts found in database')
      return []
    }

    // Get user's likes and bookmarks in a single query if userId provided
    let userLikes: string[] = []
    let userBookmarks: string[] = []

    if (userId) {
      const [likesRes, bookmarksRes] = await Promise.all([
        supabase
          .from('likes')
          .select('prompt_id')
          .eq('user_id', userId),
        supabase
          .from('bookmarks')
          .select('prompt_id')
          .eq('user_id', userId)
      ])

      userLikes = likesRes.data?.map(l => l.prompt_id) || []
      userBookmarks = bookmarksRes.data?.map(b => b.prompt_id) || []
    }

    // Filter out prompts where creator is private (unless viewer is the creator)
    const visiblePrompts = promptsWithData.filter((p: any) => !p.creator?.is_private || p.creator_id === userId)

    const result = visiblePrompts.map((prompt: any) => ({
      ...prompt,
      categories: (prompt.prompt_categories || []).map((pc: any) => pc.category).filter(Boolean),
      like_count: prompt.likes?.[0]?.count || 0,
      bookmark_count: prompt.bookmarks?.[0]?.count || 0,
      is_liked: userLikes.includes(prompt.id),
      is_bookmarked: userBookmarks.includes(prompt.id)
    }))

    logger.debug('✅ [getPublicPrompts] Successfully processed prompts:', result.length)
    return result

  } catch (err) {
    logger.error('Exception in getPublicPrompts:', err)
    return []
  }
}

// Get a single prompt by ID
export async function getPromptById(id: string, userId?: string): Promise<Prompt | null> {
  // Build query - allow public prompts or private prompts owned by current user
  let query = supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url, bio, website_url, is_private),
      like_count:likes(count),
      bookmark_count:bookmarks(count),
      prompt_categories(
        category:categories(id, slug, name, description, icon, color, sort_order)
      )
    `)
    .eq('id', id)

  // If user is authenticated, allow viewing their own private prompts
  if (userId) {
    query = query.or(`is_public.eq.true,creator_id.eq.${userId}`)
  } else {
    // If not authenticated, only allow public prompts
    query = query.eq('is_public', true)
  }

  const { data, error } = await query.single()

  if (error) {
    logger.error('Error fetching prompt:', error)
    return null
  }

  // Enforce creator privacy: if creator is private and viewer is not owner, block
  if (data?.creator?.is_private && data.creator_id !== userId) {
    return null
  }

  // Get user's like and bookmark status (in parallel)
  let isLiked = false
  let isBookmarked = false

  if (userId) {
    const [likeRes, bookmarkRes] = await Promise.all([
      supabase
        .from('likes')
        .select('id')
        .eq('prompt_id', id)
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('bookmarks')
        .select('id')
        .eq('prompt_id', id)
        .eq('user_id', userId)
        .maybeSingle()
    ])

    isLiked = !!likeRes.data
    isBookmarked = !!bookmarkRes.data
  }

  return {
    ...data,
    categories: (data as any)?.prompt_categories?.map((pc: any) => pc.category).filter(Boolean) || [],
    like_count: data.like_count?.[0]?.count || 0,
    bookmark_count: data.bookmark_count?.[0]?.count || 0,
    is_liked: isLiked,
    is_bookmarked: isBookmarked
  }
}

// Create a new prompt
export async function createPrompt(prompt: {
  title: string
  body: string
  model: string
  is_public: boolean
  creator_id: string
  category_ids?: string[]
  project_id?: string | null
}): Promise<Prompt | null> {
  logger.debug('createPrompt called')
  
  const { data, error } = await supabase
    .from('prompts')
    .insert([{
      title: prompt.title,
      body: prompt.body,
      model: prompt.model,
      is_public: prompt.is_public,
      creator_id: prompt.creator_id,
      project_id: prompt.project_id || null
    }])
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url)
    `)
    .single()

  logger.debug('Supabase response:', { ok: !error })

  if (error) {
    logger.error('Error creating prompt:', error)
    return null
  }

  // Add categories if provided
  if (prompt.category_ids && prompt.category_ids.length > 0) {
    const categoryInserts = prompt.category_ids.map(categoryId => ({
      prompt_id: data.id,
      category_id: categoryId
    }))

    const { error: categoryError } = await supabase
      .from('prompt_categories')
      .insert(categoryInserts)

    if (categoryError) {
      logger.error('Error adding categories to prompt:', categoryError)
      // Don't fail the entire operation, just log the error
    }
  }

  const result = {
    ...data,
    like_count: 0,
    bookmark_count: 0,
    is_liked: false,
    is_bookmarked: false,
    categories: []
  }

  logger.debug('createPrompt returning')
  return result
}

// Update a prompt
export async function updatePrompt(id: string, updates: {
  title?: string
  body?: string
  model?: string
  is_public?: boolean
  category_ids?: string[]
  project_id?: string | null
}): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from('prompts')
    .update({
      title: updates.title,
      body: updates.body,
      model: updates.model,
      is_public: updates.is_public,
      project_id: updates.project_id
    })
    .eq('id', id)
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url)
    `)
    .single()

  if (error) {
    logger.error('Error updating prompt:', error)
    return null
  }

  // Update categories if provided
  if (updates.category_ids !== undefined) {
    // First, remove all existing categories
    const { error: deleteError } = await supabase
      .from('prompt_categories')
      .delete()
      .eq('prompt_id', id)

    if (deleteError) {
      logger.error('Error removing existing categories:', deleteError)
    }

    // Then add new categories
    if (updates.category_ids.length > 0) {
      const categoryInserts = updates.category_ids.map(categoryId => ({
        prompt_id: id,
        category_id: categoryId
      }))

      const { error: categoryError } = await supabase
        .from('prompt_categories')
        .insert(categoryInserts)

      if (categoryError) {
        logger.error('Error adding categories to prompt:', categoryError)
        // Don't fail the entire operation, just log the error
      }
    }
  }

  return {
    ...data,
    like_count: 0,
    bookmark_count: 0,
    is_liked: false,
    is_bookmarked: false,
    categories: []
  }
}

// Delete a prompt
export async function deletePrompt(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id)

  if (error) {
    logger.error('Error deleting prompt:', error)
    return false
  }

  return true
}

// Toggle like on a prompt
export async function toggleLike(promptId: string, userId: string): Promise<boolean> {
  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('prompt_id', promptId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('prompt_id', promptId)
      .eq('user_id', userId)
    
    return !error
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert([{ prompt_id: promptId, user_id: userId }])
    
    return !error
  }
}

// Toggle bookmark on a prompt
export async function toggleBookmark(promptId: string, userId: string): Promise<boolean> {
  // Check if already bookmarked
  const { data: existingBookmark } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('prompt_id', promptId)
    .eq('user_id', userId)
    .single()

  if (existingBookmark) {
    // Unbookmark
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('prompt_id', promptId)
      .eq('user_id', userId)
    
    return !error
  } else {
    // Bookmark
    const { error } = await supabase
      .from('bookmarks')
      .insert([{ prompt_id: promptId, user_id: userId }])
    
    return !error
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    logger.error('Error fetching user:', error)
    return null
  }

  return data
}

// Get user's prompts
export async function getUserPrompts(userId: string, currentUserId?: string): Promise<Prompt[]> {
  // If viewing own prompts, show both public and private
  // If viewing someone else's prompts, only show public
  const isOwnProfile = currentUserId === userId
  
  let query = supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url),
      like_count:likes(count),
      bookmark_count:bookmarks(count)
    `)
    .eq('creator_id', userId)

  if (!isOwnProfile) {
    // Only show public prompts for other users
    query = query.eq('is_public', true)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching user prompts:', error)
    return []
  }

  // Get current user's likes and bookmarks
  let userLikes: string[] = []
  let userBookmarks: string[] = []

  if (currentUserId) {
    const { data: likes } = await supabase
      .from('likes')
      .select('prompt_id')
      .eq('user_id', currentUserId)
    
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('prompt_id')
      .eq('user_id', currentUserId)

    userLikes = likes?.map(l => l.prompt_id) || []
    userBookmarks = bookmarks?.map(b => b.prompt_id) || []
  }

  return data?.map((prompt: any) => ({
    ...prompt,
    project: prompt.project || null,
    // Categories are disabled until categories schema is installed
    categories: [],
    like_count: prompt.like_count?.[0]?.count || 0,
    bookmark_count: prompt.bookmark_count?.[0]?.count || 0,
    is_liked: userLikes.includes(prompt.id),
    is_bookmarked: userBookmarks.includes(prompt.id)
  })) || []
}

// Get popular prompts (sorted by popularity algorithm)
export async function getPopularPrompts(userId?: string): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url, is_private),
      like_count:likes(count),
      bookmark_count:bookmarks(count)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching popular prompts:', error)
    return []
  }

  // Get user's likes and bookmarks if userId provided
  let userLikes: string[] = []
  let userBookmarks: string[] = []

  if (userId) {
    const { data: likes } = await supabase
      .from('likes')
      .select('prompt_id')
      .eq('user_id', userId)
    
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('prompt_id')
      .eq('user_id', userId)

    userLikes = likes?.map(l => l.prompt_id) || []
    userBookmarks = bookmarks?.map(b => b.prompt_id) || []
  }

  // Filter out private creators (unless viewer is owner), then calculate popularity score and sort
  const promptsWithScore = (data || [])
    .filter((p: any) => !p.creator?.is_private || p.creator_id === userId)
    .map(prompt => {
    const likeCount = prompt.like_count?.[0]?.count || 0
    const bookmarkCount = prompt.bookmark_count?.[0]?.count || 0
    const createdAt = new Date(prompt.created_at)
    const now = new Date()
    const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    
    // Simple popularity algorithm:
    // - Likes are worth 2 points
    // - Bookmarks are worth 3 points
    // - Recent prompts get a time bonus (decay over time)
    // - Minimum score is 0.1 to avoid division by zero
    const timeBonus = Math.max(0.1, 1 / (1 + daysSinceCreated / 7)) // Decay over 7 days
    const popularityScore = (likeCount * 2 + bookmarkCount * 3) * timeBonus

    return {
      ...prompt,
      like_count: likeCount,
      bookmark_count: bookmarkCount,
      is_liked: userLikes.includes(prompt.id),
      is_bookmarked: userBookmarks.includes(prompt.id),
      popularity_score: popularityScore
    }
  })

  // Sort by popularity score (highest first)
  return promptsWithScore.sort((a, b) => b.popularity_score - a.popularity_score)
}

// Search prompts
export async function searchPrompts(query: string, userId?: string): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url, is_private),
      like_count:likes(count),
      bookmark_count:bookmarks(count),
      prompt_categories(
        category:categories(id, slug, name, description, icon, color, sort_order)
      )
    `)
    .eq('is_public', true)
    .or(`title.ilike.%${query}%,model.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error searching prompts:', error)
    return []
  }

  // Get user's likes and bookmarks if userId provided
  let userLikes: string[] = []
  let userBookmarks: string[] = []

  if (userId) {
    const { data: likes } = await supabase
      .from('likes')
      .select('prompt_id')
      .eq('user_id', userId)
    
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('prompt_id')
      .eq('user_id', userId)

    userLikes = likes?.map(l => l.prompt_id) || []
    userBookmarks = bookmarks?.map(b => b.prompt_id) || []
  }

  return (data || [])
    .filter((p: any) => !p.creator?.is_private || p.creator_id === userId)
    .map((prompt: any) => ({
      ...prompt,
      categories: (prompt.prompt_categories || []).map((pc: any) => pc.category).filter(Boolean),
      like_count: prompt.like_count?.[0]?.count || 0,
      bookmark_count: prompt.bookmark_count?.[0]?.count || 0,
      is_liked: userLikes.includes(prompt.id),
      is_bookmarked: userBookmarks.includes(prompt.id)
    })) || []
}

// Categories API
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    logger.error('Error fetching categories:', error)
    return []
  }
  return (data as Category[]) || []
}

export async function addCategoryToPrompt(promptId: string, categoryId: string): Promise<boolean> {
  const { error } = await supabase
    .from('prompt_categories')
    .insert([{ prompt_id: promptId, category_id: categoryId }])

  if (error) {
    logger.error('addCategoryToPrompt error:', error)
    return false
  }
  return true
}

export async function removeCategoryFromPrompt(promptId: string, categoryId: string): Promise<boolean> {
  const { error } = await supabase
    .from('prompt_categories')
    .delete()
    .eq('prompt_id', promptId)
    .eq('category_id', categoryId)

  if (error) {
    logger.error('removeCategoryFromPrompt error:', error)
    return false
  }
  return true
}

export async function setPromptCategories(promptId: string, categoryIds: string[]): Promise<boolean> {
  const { data: existing, error: fetchError } = await supabase
    .from('prompt_categories')
    .select('category_id')
    .eq('prompt_id', promptId)

  if (fetchError) {
    logger.error('setPromptCategories fetch error:', fetchError)
    return false
  }

  const current = new Set((existing || []).map((r: any) => r.category_id))
  const desired = new Set(categoryIds)

  const toAdd = [...desired].filter(id => !current.has(id))
  const toRemove = [...current].filter(id => !desired.has(id))

  if (toAdd.length > 0) {
    const { error: addError } = await supabase
      .from('prompt_categories')
      .insert(toAdd.map(id => ({ prompt_id: promptId, category_id: id })))
    if (addError) {
      logger.error('setPromptCategories add error:', addError)
      return false
    }
  }

  if (toRemove.length > 0) {
    const { error: delError } = await supabase
      .from('prompt_categories')
      .delete()
      .eq('prompt_id', promptId)
      .in('category_id', toRemove)
    if (delError) {
      logger.error('setPromptCategories delete error:', delError)
      return false
    }
  }

  return true
}

export async function getPublicPromptsByCategorySlug(slug: string, userId?: string): Promise<Prompt[]> {
  const { data: cat, error: catErr } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()

  if (catErr || !cat) return []

  const { data: pc, error: pcErr } = await supabase
    .from('prompt_categories')
    .select('prompt_id')
    .eq('category_id', (cat as any).id)

  if (pcErr || !pc || pc.length === 0) return []

  const promptIds = pc.map(r => r.prompt_id)

  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url, is_private),
      like_count:likes(count),
      bookmark_count:bookmarks(count),
      prompt_categories(
        category:categories(id, slug, name, description, icon, color, sort_order)
      )
    `)
    .in('id', promptIds)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  // Get user's likes and bookmarks if userId provided
  let userLikes: string[] = []
  let userBookmarks: string[] = []
  if (userId) {
    const { data: likes } = await supabase
      .from('likes')
      .select('prompt_id')
      .eq('user_id', userId)
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('prompt_id')
      .eq('user_id', userId)
    userLikes = likes?.map(l => l.prompt_id) || []
    userBookmarks = bookmarks?.map(b => b.prompt_id) || []
  }

  return data.map((p: any) => ({
    ...p,
    categories: (p.prompt_categories || []).map((x: any) => x.category).filter(Boolean),
    like_count: p.like_count?.[0]?.count || 0,
    bookmark_count: p.bookmark_count?.[0]?.count || 0,
    is_liked: userLikes.includes(p.id),
    is_bookmarked: userBookmarks.includes(p.id)
  }))
}

// Get creators leaderboard based on engagement on their public prompts
export async function getCreatorsLeaderboard(): Promise<LeaderboardCreator[]> {
  try {
    // Fetch public prompts with creator info (including privacy)
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select(`
        id,
        creator_id,
        creator:profiles!prompts_creator_id_fkey(id, name, avatar_url, is_private, created_at)
      `)
      .eq('is_public', true)

    if (promptsError || !prompts) {
      logger.error('Error fetching prompts for leaderboard:', promptsError)
      return []
    }

    // Filter out private creators
    const visiblePrompts = prompts.filter((p: any) => !p.creator?.is_private)

    if (visiblePrompts.length === 0) return []

    const allPromptIds: string[] = visiblePrompts.map((p: any) => p.id)

    // Map prompt -> creator for aggregation
    const promptIdToCreatorId = new Map<string, string>()
    const creatorIdToInfo = new Map<string, { id: string, name: string, avatar_url?: string | null, created_at?: string | null }>()
    const creatorPromptCount = new Map<string, number>()
    visiblePrompts.forEach((p: any) => {
      promptIdToCreatorId.set(p.id, p.creator_id)
      if (p.creator) {
        creatorIdToInfo.set(p.creator_id, {
          id: p.creator.id,
          name: p.creator.name || 'Unknown',
          avatar_url: p.creator.avatar_url || null,
          created_at: p.creator.created_at || null
        })
      }
      const current = creatorPromptCount.get(p.creator_id) || 0
      creatorPromptCount.set(p.creator_id, current + 1)
    })

    // Fetch likes and bookmarks related to these prompts
    const [likesRes, bookmarksRes] = await Promise.all([
      supabase.from('likes').select('prompt_id').in('prompt_id', allPromptIds),
      supabase.from('bookmarks').select('prompt_id').in('prompt_id', allPromptIds)
    ])

    const likes = likesRes.data || []
    const bookmarks = bookmarksRes.data || []

    // Aggregate counts per creator
    const creatorStats = new Map<string, { likes: number, bookmarks: number }>()

    const incrementForCreator = (promptId: string, field: 'likes' | 'bookmarks') => {
      const creatorId = promptIdToCreatorId.get(promptId)
      if (!creatorId) return
      const current = creatorStats.get(creatorId) || { likes: 0, bookmarks: 0 }
      current[field] += 1
      creatorStats.set(creatorId, current)
    }

    likes.forEach((row: any) => incrementForCreator(row.prompt_id, 'likes'))
    bookmarks.forEach((row: any) => incrementForCreator(row.prompt_id, 'bookmarks'))

    // Build result array
    const result: LeaderboardCreator[] = Array.from(creatorStats.entries()).map(([creatorId, stats]) => {
      const info = creatorIdToInfo.get(creatorId)
      return {
        creator: {
          id: info?.id || creatorId,
          name: info?.name || 'Unknown',
          avatar_url: info?.avatar_url || null
        },
        likes: stats.likes,
        bookmarks: stats.bookmarks,
        promptsCreated: creatorPromptCount.get(creatorId) || 0,
        joinedAt: info?.created_at || null
      }
    })

    // Sort by likes desc, then bookmarks desc, then name asc
    result.sort((a, b) => {
      if (b.likes !== a.likes) return b.likes - a.likes
      if (b.bookmarks !== a.bookmarks) return b.bookmarks - a.bookmarks
      return a.creator.name.localeCompare(b.creator.name)
    })

    return result
  } catch (e) {
    logger.error('Error building creators leaderboard:', e)
    return []
  }
}

// Get all prompts that a user has liked (including private ones they own)
export async function getLikedPrompts(userId: string): Promise<Prompt[]> {
  // First get the prompt IDs that the user has liked
  const { data: likes, error: likesError } = await supabase
    .from('likes')
    .select('prompt_id')
    .eq('user_id', userId)

  if (likesError) {
    logger.error('Error fetching liked prompt IDs:', likesError)
    return []
  }

  if (!likes || likes.length === 0) {
    return []
  }

  const promptIds = likes.map(like => like.prompt_id)

  // Now get the full prompt data for those IDs
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(
        id,
        name,
        avatar_url,
        bio,
        website_url
      ),
      like_count:likes(count),
      bookmark_count:bookmarks(count)
    `)
    .in('id', promptIds)

  if (promptsError) {
    logger.error('Error fetching liked prompts:', promptsError)
    return []
  }

  // Get user's bookmarks to determine bookmark status
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('prompt_id')
    .eq('user_id', userId)

  const userBookmarks = bookmarks?.map(b => b.prompt_id) || []

  return prompts?.map(prompt => ({
    ...prompt,
    like_count: prompt.like_count?.[0]?.count || 0,
    bookmark_count: prompt.bookmark_count?.[0]?.count || 0,
    is_liked: true, // User has liked this prompt
    is_bookmarked: userBookmarks.includes(prompt.id)
  })) || []
}

// Get all prompts that a user has bookmarked (including private ones they own)
export async function getBookmarkedPrompts(userId: string): Promise<Prompt[]> {
  // First get the prompt IDs that the user has bookmarked
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from('bookmarks')
    .select('prompt_id')
    .eq('user_id', userId)

  if (bookmarksError) {
    logger.error('Error fetching bookmarked prompt IDs:', bookmarksError)
    return []
  }

  if (!bookmarks || bookmarks.length === 0) {
    return []
  }

  const promptIds = bookmarks.map(bookmark => bookmark.prompt_id)

  // Now get the full prompt data for those IDs
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(
        id,
        name,
        avatar_url,
        bio,
        website_url
      ),
      like_count:likes(count),
      bookmark_count:bookmarks(count)
    `)
    .in('id', promptIds)

  if (promptsError) {
    logger.error('Error fetching bookmarked prompts:', promptsError)
    return []
  }

  // Get user's likes to determine like status
  const { data: likes } = await supabase
    .from('likes')
    .select('prompt_id')
    .eq('user_id', userId)

  const userLikes = likes?.map(l => l.prompt_id) || []

  return prompts?.map(prompt => ({
    ...prompt,
    like_count: prompt.like_count?.[0]?.count || 0,
    bookmark_count: prompt.bookmark_count?.[0]?.count || 0,
    is_liked: userLikes.includes(prompt.id),
    is_bookmarked: true // User has bookmarked this prompt
  })) || []
}

// Get user engagement stats (likes and bookmarks received on their prompts)
export async function getUserEngagementStats(userId: string, includePrivate: boolean = false): Promise<{
  prompts_created: number
  likes_received: number
  bookmarks_received: number
}> {
  try {
    // Get user's created prompts (public only by default, include private if specified)
    let query = supabase
      .from('prompts')
      .select('id')
      .eq('creator_id', userId)
    
    if (!includePrivate) {
      query = query.eq('is_public', true)
    }

    const { data: prompts, error: promptsError } = await query

    if (promptsError) {
      console.error('Error fetching user prompts:', promptsError)
      return { prompts_created: 0, likes_received: 0, bookmarks_received: 0 }
    }

    const promptIds = prompts?.map(p => p.id) || []
    const promptsCreated = promptIds.length

    if (promptIds.length === 0) {
      return { prompts_created: 0, likes_received: 0, bookmarks_received: 0 }
    }

    // Get total likes received on user's prompts
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .in('prompt_id', promptIds)

    if (likesError) {
      logger.error('Error fetching likes received:', likesError)
      return { prompts_created: promptsCreated, likes_received: 0, bookmarks_received: 0 }
    }

    // Get total bookmarks received on user's prompts
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('id')
      .in('prompt_id', promptIds)

    if (bookmarksError) {
      logger.error('Error fetching bookmarks received:', bookmarksError)
      return { prompts_created: promptsCreated, likes_received: likes?.length || 0, bookmarks_received: 0 }
    }

    return {
      prompts_created: promptsCreated,
      likes_received: likes?.length || 0,
      bookmarks_received: bookmarks?.length || 0
    }
  } catch (error) {
    logger.error('Error calculating user engagement stats:', error)
    return { prompts_created: 0, likes_received: 0, bookmarks_received: 0 }
  }
}

// Get comments for a prompt (with nested replies)
export async function getCommentsForPrompt(promptId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles!comments_user_id_fkey(id, name, avatar_url)
    `)
    .eq('prompt_id', promptId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching comments:', error)
    return []
  }

  // Build nested structure
  const commentsMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  data?.forEach(comment => {
    const commentWithReplies: Comment = {
      ...comment,
      replies: []
    }
    commentsMap.set(comment.id, commentWithReplies)

    if (comment.parent_id) {
      const parent = commentsMap.get(comment.parent_id)
      if (parent) {
        parent.replies = parent.replies || []
        parent.replies.push(commentWithReplies)
      }
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  return rootComments
}

// Create a new comment
export async function createComment(comment: {
  prompt_id: string
  user_id: string
  content: string
  parent_id?: string
}): Promise<Comment | null> {
  logger.debug('createComment called')
  
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select(`
      *,
      user:profiles!comments_user_id_fkey(id, name, avatar_url)
    `)
    .single()

  logger.debug('Supabase response:', { ok: !error })

  if (error) {
    logger.error('Error creating comment:', error)
    return null
  }

  return data
}

// Update a comment
export async function updateComment(commentId: string, content: string): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', commentId)
    .select(`
      *,
      user:profiles!comments_user_id_fkey(id, name, avatar_url)
    `)
    .single()

  if (error) {
    logger.error('Error updating comment:', error)
    return null
  }

  return data
}

// Delete a comment (soft delete)
export async function deleteComment(commentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true })
    .eq('id', commentId)

  if (error) {
    logger.error('Error deleting comment:', error)
    return false
  }

  return true
}

// Get comment count for a prompt
export async function getCommentCountForPrompt(promptId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('prompt_id', promptId)
    .eq('is_deleted', false)

  if (error) {
    logger.error('Error fetching comment count:', error)
    return 0
  }

  return count || 0
}

// Projects API
export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })

  if (error) {
    logger.error('Error fetching projects:', error)
    return []
  }

  return (data || []).map((project: any) => ({
    ...project,
    // Relationship-based count removed due to missing FK; default to 0.
    prompt_count: 0
  }))
}

export async function createProject(project: {
  name: string
  description?: string
  color?: string
  user_id: string
}): Promise<Project | null> {
  // Get the next sort order
  const { data: lastProject } = await supabase
    .from('projects')
    .select('sort_order')
    .eq('user_id', project.user_id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = lastProject?.[0]?.sort_order !== undefined 
    ? (lastProject[0].sort_order + 1) 
    : 0

  const { data, error } = await supabase
    .from('projects')
    .insert([{
      ...project,
      sort_order: nextSortOrder
    }])
    .select()
    .single()

  if (error) {
    logger.error('Error creating project:', error)
    return null
  }

  return { ...data, prompt_count: 0 }
}

export async function updateProject(projectId: string, updates: {
  name?: string
  description?: string
  color?: string
}): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select(`
      *,
      prompt_count:prompts(count)
    `)
    .single()

  if (error) {
    logger.error('Error updating project:', error)
    return null
  }

  return {
    ...data,
    prompt_count: data.prompt_count?.[0]?.count || 0
  }
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    logger.error('Error deleting project:', error)
    return false
  }

  return true
}

export async function movePromptToProject(promptId: string, projectId: string | null): Promise<boolean> {
  const { error } = await supabase
    .from('prompts')
    .update({ project_id: projectId })
    .eq('id', promptId)

  if (error) {
    logger.error('Error moving prompt to project:', error)
    return false
  }

  return true
}

export async function getPromptsByProject(projectId: string, userId?: string): Promise<Prompt[]> {
  // Build query without FK-based project relation to avoid schema dependency
  let query = supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url, is_private),
      prompt_categories(
        category:categories(id, slug, name, description, icon, color, sort_order)
      ),
      like_count:likes(count),
      bookmark_count:bookmarks(count)
    `)
    .eq('project_id', projectId)

  // If no user context, restrict to public prompts only. Owners can see all.
  if (!userId) {
    query = query.eq('is_public', true)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching prompts by project:', error)
    return []
  }

  // Get user's likes and bookmarks if userId provided
  let userLikes: string[] = []
  let userBookmarks: string[] = []
  if (userId) {
    const { data: likes } = await supabase
      .from('likes')
      .select('prompt_id')
      .eq('user_id', userId)
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('prompt_id')
      .eq('user_id', userId)
    userLikes = likes?.map(l => l.prompt_id) || []
    userBookmarks = bookmarks?.map(b => b.prompt_id) || []
  }

  return (data || [])
    .filter((p: any) => !p.creator?.is_private || p.creator_id === userId)
    .map((prompt: any) => ({
      ...prompt,
      // Project relationship omitted intentionally; keep null for now
      project: null,
      categories: (prompt.prompt_categories || []).map((pc: any) => pc.category).filter(Boolean),
      like_count: prompt.like_count?.[0]?.count || 0,
      bookmark_count: prompt.bookmark_count?.[0]?.count || 0,
      is_liked: userLikes.includes(prompt.id),
      is_bookmarked: userBookmarks.includes(prompt.id)
    }))
}