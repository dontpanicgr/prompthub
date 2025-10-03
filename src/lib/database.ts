import { supabase } from './supabase'

// Test database connection and table existence
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    console.log('Supabase client:', supabase)
    console.log('Supabase URL:', supabase.supabaseUrl)
    console.log('Supabase Key (first 20 chars):', supabase.supabaseKey?.substring(0, 20) + '...')
    
    // Test 1: Basic Supabase health check
    console.log('Test 1: Basic health check...')
    const { data: healthData, error: healthError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1)
    
    console.log('Health check result:', { data: healthData, error: healthError })
    
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
        creator:profiles!prompts_creator_id_fkey(id, name, avatar_url)
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

    const result = promptsWithCreator.map(prompt => ({
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
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url, bio, website_url),
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
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url),
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

  // Calculate popularity score and sort
  const promptsWithScore = data?.map(prompt => {
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
  }) || []

  // Sort by popularity score (highest first)
  return promptsWithScore.sort((a, b) => b.popularity_score - a.popularity_score)
}

// Search prompts
export async function searchPrompts(query: string, userId?: string): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      creator:profiles!prompts_creator_id_fkey(id, name, avatar_url),
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

  return data?.map(prompt => ({
    ...prompt,
    like_count: prompt.like_count?.[0]?.count || 0,
    bookmark_count: prompt.bookmark_count?.[0]?.count || 0,
    is_liked: userLikes.includes(prompt.id),
    is_bookmarked: userBookmarks.includes(prompt.id)
  })) || []
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