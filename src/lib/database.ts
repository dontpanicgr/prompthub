import { supabase } from './supabase'

// Test database connection and table existence
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    console.log('Supabase client:', supabase)
    console.log('Supabase URL:', supabase.supabaseUrl)
    console.log('Supabase Key (first 20 chars):', supabase.supabaseKey?.substring(0, 20) + '...')
    
    // Test 1: Basic Supabase health check using a public table
    console.log('Test 1: Basic health check (profiles)...')
    const { data: healthData, error: healthError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    console.log('Health check result (profiles):', { data: healthData, error: healthError })
    
    // Test 2: Try to access profiles table
    console.log('Test 2: Accessing profiles table...')
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    console.log('Profiles table result:', { data: profilesData, error: profilesError })
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError)
      console.error('Error code:', profilesError.code)
      console.error('Error message:', profilesError.message)
      console.error('Error details:', profilesError.details)
      console.error('Error hint:', profilesError.hint)
    } else {
      console.log('Profiles table accessible')
    }
    
    // Test 3: Try to access prompts table
    console.log('Test 3: Accessing prompts table...')
    const { data: promptsData, error: promptsError } = await supabase
      .from('prompts')
      .select('id')
      .limit(1)
    
    console.log('Prompts table result:', { data: promptsData, error: promptsError })
    
    if (promptsError) {
      console.error('Prompts table error:', promptsError)
      console.error('Error code:', promptsError.code)
      console.error('Error message:', promptsError.message)
      console.error('Error details:', promptsError.details)
      console.error('Error hint:', promptsError.hint)
    } else {
      console.log('Prompts table accessible')
    }
    
    // If we can access at least one table, consider it a success
    const hasAccess = !profilesError || !promptsError
    console.log('Database connection test result:', hasAccess)
    return hasAccess
    
  } catch (error) {
    console.error('Database test exception:', error)
    console.error('Exception details:', JSON.stringify(error, null, 2))
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
  created_at: string
  updated_at: string
  creator: {
    id: string
    name: string
    avatar_url?: string
  }
  like_count: number
  bookmark_count: number
  is_liked?: boolean
  is_bookmarked?: boolean
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

// Get all public prompts
export async function getPublicPrompts(userId?: string): Promise<Prompt[]> {
  try {
    console.log('Fetching public prompts...')
    
    // First, try a simple query to get basic prompts
    const { data: basicData, error: basicError } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (basicError) {
      console.error('Error fetching basic prompts:', basicError)
      return []
    }

    console.log('Basic prompts fetched successfully:', basicData?.length || 0)

    // If no basic data, return empty array
    if (!basicData || basicData.length === 0) {
      console.log('No prompts found in database')
      return []
    }

    // Now try to get creator information
    const { data: promptsWithCreator, error: creatorError } = await supabase
      .from('prompts')
      .select(`
        *,
        creator:profiles!prompts_creator_id_fkey(id, name, avatar_url, is_private)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (creatorError) {
      console.error('Error fetching prompts with creator:', creatorError)
      // Fallback to basic data without creator info
      return basicData.map(prompt => ({
        ...prompt,
        creator: { id: prompt.creator_id, name: 'Unknown', avatar_url: null },
        like_count: 0,
        bookmark_count: 0,
        is_liked: false,
        is_bookmarked: false
      }))
    }

    // Try to get like counts using aggregation
    const { data: likeCounts, error: likeError } = await supabase
      .from('likes')
      .select('prompt_id')
      .in('prompt_id', promptsWithCreator.map(p => p.id))

    if (likeError) {
      console.error('Error fetching like counts:', likeError)
    }

    // Try to get bookmark counts using aggregation
    const { data: bookmarkCounts, error: bookmarkError } = await supabase
      .from('bookmarks')
      .select('prompt_id')
      .in('prompt_id', promptsWithCreator.map(p => p.id))

    if (bookmarkError) {
      console.error('Error fetching bookmark counts:', bookmarkError)
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

    // Create like and bookmark count maps
    const likeCountMap = new Map()
    const bookmarkCountMap = new Map()

    if (likeCounts) {
      // Count likes per prompt
      likeCounts.forEach(like => {
        const currentCount = likeCountMap.get(like.prompt_id) || 0
        likeCountMap.set(like.prompt_id, currentCount + 1)
      })
    }

    if (bookmarkCounts) {
      // Count bookmarks per prompt
      bookmarkCounts.forEach(bookmark => {
        const currentCount = bookmarkCountMap.get(bookmark.prompt_id) || 0
        bookmarkCountMap.set(bookmark.prompt_id, currentCount + 1)
      })
    }

    // Filter out prompts where creator is private (unless viewer is the creator)
    const visiblePrompts = promptsWithCreator.filter((p: any) => !p.creator?.is_private || p.creator_id === userId)

    const result = visiblePrompts.map(prompt => ({
      ...prompt,
      like_count: likeCountMap.get(prompt.id) || 0,
      bookmark_count: bookmarkCountMap.get(prompt.id) || 0,
      is_liked: userLikes.includes(prompt.id),
      is_bookmarked: userBookmarks.includes(prompt.id)
    }))

    console.log('Successfully processed prompts:', result.length)
    return result

  } catch (err) {
    console.error('Exception in getPublicPrompts:', err)
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
      bookmark_count:bookmarks(count)
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
    console.error('Error fetching prompt:', error)
    return null
  }

  // Enforce creator privacy: if creator is private and viewer is not owner, block
  if (data?.creator?.is_private && data.creator_id !== userId) {
    return null
  }

  // Get user's like and bookmark status
  let isLiked = false
  let isBookmarked = false

  if (userId) {
    const { data: like } = await supabase
      .from('likes')
      .select('id')
      .eq('prompt_id', id)
      .eq('user_id', userId)
      .single()

    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('prompt_id', id)
      .eq('user_id', userId)
      .single()

    isLiked = !!like
    isBookmarked = !!bookmark
  }

  return {
    ...data,
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
}): Promise<Prompt | null> {
  console.log('createPrompt called with:', prompt)
  
  const { data, error } = await supabase
    .from('prompts')
    .insert([prompt])
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url)
    `)
    .single()

  console.log('Supabase response:', { data, error })

  if (error) {
    console.error('Error creating prompt:', error)
    return null
  }

  const result = {
    ...data,
    like_count: 0,
    bookmark_count: 0,
    is_liked: false,
    is_bookmarked: false
  }

  console.log('createPrompt returning:', result)
  return result
}

// Update a prompt
export async function updatePrompt(id: string, updates: {
  title?: string
  body?: string
  model?: string
  is_public?: boolean
}): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from('prompts')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Error updating prompt:', error)
    return null
  }

  return {
    ...data,
    like_count: 0,
    bookmark_count: 0,
    is_liked: false,
    is_bookmarked: false
  }
}

// Delete a prompt
export async function deletePrompt(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting prompt:', error)
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
    console.error('Error fetching user:', error)
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
    console.error('Error fetching user prompts:', error)
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

  return data?.map(prompt => ({
    ...prompt,
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
    console.error('Error fetching popular prompts:', error)
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
      bookmark_count:bookmarks(count)
    `)
    .eq('is_public', true)
    .or(`title.ilike.%${query}%,model.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching prompts:', error)
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
    .map(prompt => ({
    ...prompt,
    like_count: prompt.like_count?.[0]?.count || 0,
    bookmark_count: prompt.bookmark_count?.[0]?.count || 0,
    is_liked: userLikes.includes(prompt.id),
    is_bookmarked: userBookmarks.includes(prompt.id)
  })) || []
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
      console.error('Error fetching prompts for leaderboard:', promptsError)
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
    console.error('Error building creators leaderboard:', e)
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
    console.error('Error fetching liked prompt IDs:', likesError)
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
    console.error('Error fetching liked prompts:', promptsError)
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
    console.error('Error fetching bookmarked prompt IDs:', bookmarksError)
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
    console.error('Error fetching bookmarked prompts:', promptsError)
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
      console.error('Error fetching likes received:', likesError)
      return { prompts_created: promptsCreated, likes_received: 0, bookmarks_received: 0 }
    }

    // Get total bookmarks received on user's prompts
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('id')
      .in('prompt_id', promptIds)

    if (bookmarksError) {
      console.error('Error fetching bookmarks received:', bookmarksError)
      return { prompts_created: promptsCreated, likes_received: likes?.length || 0, bookmarks_received: 0 }
    }

    return {
      prompts_created: promptsCreated,
      likes_received: likes?.length || 0,
      bookmarks_received: bookmarks?.length || 0
    }
  } catch (error) {
    console.error('Error calculating user engagement stats:', error)
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
    console.error('Error fetching comments:', error)
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
  console.log('createComment called with:', comment)
  
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select(`
      *,
      user:profiles!comments_user_id_fkey(id, name, avatar_url)
    `)
    .single()

  console.log('Supabase response:', { data, error })

  if (error) {
    console.error('Error creating comment:', error)
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
    console.error('Error updating comment:', error)
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
    console.error('Error deleting comment:', error)
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
    console.error('Error fetching comment count:', error)
    return 0
  }

  return count || 0
}