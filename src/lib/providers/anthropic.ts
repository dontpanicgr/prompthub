// Anthropic provider adapter
// File: src/lib/providers/anthropic.ts

import { ProviderClient, ProviderConfig, HttpClient, ProviderError, SuggestArgs, ChatArgs, SuggestResponse, ChatResponse } from './base'

export class AnthropicProvider implements ProviderClient {
  private http: HttpClient

  constructor(config: ProviderConfig) {
    this.http = new HttpClient({
      ...config,
      baseUrl: config.baseUrl || 'https://api.anthropic.com/v1'
    })
  }

  async suggest(args: SuggestArgs): Promise<SuggestResponse> {
    const { text, variant, model = 'claude-3-haiku-20240307', temperature = 0.3, maxTokens = 1000 } = args
    
    const systemPrompt = this.getSystemPrompt(variant)
    
    try {
      const response = await this.http.request<AnthropicResponse>('/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.http['config'].apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [
            { role: 'user', content: text }
          ]
        })
      })

      const suggestion = response.content[0]?.text || ''
      const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0
      const costUsd = this.calculateCost(model, tokensUsed)

      return {
        suggestion,
        meta: {
          provider: 'anthropic',
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
        `Anthropic suggest failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'anthropic'
      )
    }
  }

  async chat(args: ChatArgs): Promise<ChatResponse> {
    const { messages, model = 'claude-3-haiku-20240307', temperature = 0.7, maxTokens = 2000 } = args
    
    // Separate system message from user messages
    const systemMessage = messages.find(m => m.role === 'system')
    const userMessages = messages.filter(m => m.role !== 'system')
    
    try {
      const response = await this.http.request<AnthropicResponse>('/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.http['config'].apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemMessage?.content,
          messages: userMessages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        })
      })

      const content = response.content[0]?.text || ''
      const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0
      const costUsd = this.calculateCost(model, tokensUsed)

      return {
        content,
        meta: {
          provider: 'anthropic',
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
        `Anthropic chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'anthropic'
      )
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Anthropic doesn't have a models endpoint, so we test with a minimal request
      await this.http.request('/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.http['config'].apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      })
      return true
    } catch {
      return false
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

  private calculateCost(model: string, tokens: number): number {
    // Anthropic pricing per 1K tokens (as of 2024)
    const pricing: Record<string, { input: number, output: number }> = {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
    }
    
    const modelPricing = pricing[model] || pricing['claude-3-haiku-20240307']
    // Assume 70% input, 30% output tokens for cost estimation
    const inputTokens = Math.floor(tokens * 0.7)
    const outputTokens = Math.floor(tokens * 0.3)
    
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1000
  }
}

interface AnthropicResponse {
  content: Array<{
    text: string
  }>
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}
