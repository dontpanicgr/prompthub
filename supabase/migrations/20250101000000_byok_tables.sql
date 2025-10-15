-- Migration: Create BYOK tables and RLS policies
-- File: supabase/migrations/20250101000000_byok_tables.sql

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table for storing user-provided API keys
CREATE TABLE user_provider_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'deepseek', 'openai_compatible')),
  encrypted_key BYTEA NOT NULL,
  key_fingerprint TEXT NOT NULL, -- First 8 chars of hashed key for display
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, provider)
);

-- Table for tracking AI usage and rate limiting
CREATE TABLE ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  cost_usd NUMERIC(10, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_provider_keys_user_id ON user_provider_keys(user_id);
CREATE INDEX idx_user_provider_keys_provider ON user_provider_keys(provider);
CREATE INDEX idx_ai_usage_user_id_created_at ON ai_usage(user_id, created_at);
CREATE INDEX idx_ai_usage_provider_created_at ON ai_usage(provider, created_at);

-- RLS Policies for user_provider_keys
ALTER TABLE user_provider_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own provider keys" ON user_provider_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provider keys" ON user_provider_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider keys" ON user_provider_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provider keys" ON user_provider_keys
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_usage
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert usage records" ON ai_usage
  FOR INSERT WITH CHECK (true); -- Service role will insert

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_provider_keys
CREATE TRIGGER update_user_provider_keys_updated_at
  BEFORE UPDATE ON user_provider_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to encrypt API key
CREATE OR REPLACE FUNCTION encrypt_api_key(key TEXT, master_key TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(key, master_key);
END;
$$ LANGUAGE plpgsql;

-- Function to decrypt API key
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_key BYTEA, master_key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_key, master_key);
END;
$$ LANGUAGE plpgsql;
