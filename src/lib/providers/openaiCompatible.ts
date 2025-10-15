// OpenAI-compatible provider adapter for BYOM (Bring Your Own Model)
// File: src/lib/providers/openaiCompatible.ts

import { ProviderClient, ProviderConfig, HttpClient, ProviderError, SuggestArgs, ChatArgs, SuggestResponse, ChatResponse } from './base'

export class OpenAICompatibleProvider implements ProviderClient {
  private http: HttpClient

  constructor(config: ProviderConfig) {
    this.http = new HttpClient({
      ...config,
      baseUrl: config.baseUrl || 'http://localhost:11434/v1' // Default Ollama
    })
  }

  async suggest(args: SuggestArgs): Promise<SuggestResponse> {
    const { text, variant, model = 'llama2', temperature = 0.3, maxTokens = 1000 } = args
    
    const systemPrompt = this.getSystemPrompt(variant)
    
    try {
      const response = await this.http.request<OpenAICompatibleResponse>('/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.http['config'].apiKey || 'ollama'}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature,
          max_tokens: maxTokens,
          stream: false
        })
      })

      const suggestion = response.choices[0]?.message?.content || ''
      const tokensUsed = response.usage?.total_tokens || 0
      const costUsd = 0 // BYOM typically has no cost

      return {
        suggestion,
        meta: {
          provider: 'openai_compatible',
          model,
          tokensUsed,
          costUsd
        }
      }
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error
      }
      throw new ProviderError(
        `OpenAI-compatible suggest failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'openai_compatible'
      )
    }
  }

  async chat(args: ChatArgs): Promise<ChatResponse> {
    const { messages, model = 'llama2', temperature = 0.7, maxTokens = 2000, stream = false } = args
    
    try {
      const response = await this.http.request<OpenAICompatibleResponse>('/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.http['config'].apiKey || 'ollama'}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream
        })
      })

      const content = response.choices[0]?.message?.content || ''
      const tokensUsed = response.usage?.total_tokens || 0
      const costUsd = 0 // BYOM typically has no cost

      return {
        content,
        meta: {
          provider: 'openai_compatible',
          model,
          tokensUsed,
          costUsd
        }
      }
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error
      }
      throw new ProviderError(
        `OpenAI-compatible chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'openai_compatible'
      )
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Try to list models first
      await this.http.request('/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.http['config'].apiKey || 'ollama'}`
        }
      })
      return true
    } catch {
      // If models endpoint fails, try a simple chat completion
      try {
        await this.http.request('/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.http['config'].apiKey || 'ollama'}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama2',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 1
          })
        })
        return true
      } catch {
        return false
      }
    }
  }

  private getSystemPrompt(variant: SuggestArgs['variant']): string {
    const prompts = {
      rewrite: `You are an expert prompt engineer. Rewrite the following prompt to be clearer, more specific, and more effective. Maintain the original intent while improving clarity and structure. Return only the rewritten prompt, no explanations.`,
      
      clarify: `You are an expert prompt engineer. The following prompt may be unclear or ambiguous. Rewrite it to be more specific and clear about what the AI should do. Add necessary context and remove ambiguity. Return only the clarified prompt, no explanations.`,
      
      shorten: `You are an expert prompt engineer. The following prompt is too long or verbose. Rewrite it to be more concise while preserving all essential information and intent. Return only the shortened prompt, no explanations.`,
      
      expand: `You are an expert prompt engineer. The following prompt is too brief or lacks detail. Expand it with more specific instructions, context, and examples to make it more effective. Return only the expanded prompt, no explanations.`,
      
      variables: `You are an expert prompt engineer. The following prompt could benefit from variables or placeholders to make it more reusable. Add appropriate variables (like {topic}, {style}, {length}) and rewrite the prompt to use them effectively. Return only the improved prompt with variables, no explanations.`
    }
    
    return prompts[variant]
  }
}

interface OpenAICompatibleResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage?: {
    total_tokens: number
    prompt_tokens: number
    completion_tokens: number
  }
}

// Common BYOM endpoints and configurations
export const BYOM_CONFIGS = {
  ollama: {
    baseUrl: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    models: ['llama2', 'codellama', 'mistral', 'neural-chat', 'starling-lm']
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: 'sk-or-v1-...', // User provides
    models: ['meta-llama/llama-2-70b-chat', 'mistralai/mistral-7b-instruct', 'openai/gpt-3.5-turbo']
  },
  together: {
    baseUrl: 'https://api.together.xyz/v1',
    apiKey: 'sk-...', // User provides
    models: ['meta-llama/Llama-2-70b-chat-hf', 'mistralai/Mistral-7B-Instruct-v0.1']
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: 'gsk_...', // User provides
    models: ['llama2-70b-4096', 'mixtral-8x7b-32768']
  }
}
