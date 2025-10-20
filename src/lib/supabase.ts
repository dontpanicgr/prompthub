import { createClient } from '@supabase/supabase-js'
import { logger, maskSecret } from './utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

logger.debug('Environment check:')
logger.debug('NODE_ENV:', process.env.NODE_ENV)
logger.debug('NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl)
logger.debug('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Missing Supabase environment variables:')
  logger.error('URL present:', !!supabaseUrl)
  logger.error('Key present:', !!supabaseAnonKey)
  throw new Error('Missing Supabase environment variables')
}

logger.debug('Supabase URL:', maskSecret(supabaseUrl))
logger.debug('Supabase Key:', maskSecret(supabaseAnonKey))

// Create Supabase client with proper OAuth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
    // Remove flowType - let Supabase handle it automatically
  }
})

logger.debug('Supabase client created successfully')
logger.debug('Client URL:', maskSecret(supabase.supabaseUrl))
logger.debug('Client Key:', maskSecret(supabase.supabaseKey))
