// DeepSeek provider adapter
// File: src/lib/providers/deepseek.ts

import { ProviderClient, ProviderConfig, HttpClient, ProviderError, SuggestArgs, ChatArgs, SuggestResponse, ChatResponse } from './base'

export class DeepSeekProvider implements ProviderClient {
  private http: HttpClient

  constructor(config: ProviderConfig) {
    this.http = new HttpClient({
      ...config,
      baseUrl: config.baseUrl || 'https://api.deepseek.com/v1'
    })
  }

  async suggest(args: SuggestArgs): Promise<SuggestResponse> {
    const { text, variant, model = 'deepseek-chat', temperature = 0.3, maxTokens = 1000 } = args
    
    const systemPrompt = this.getSystemPrompt(variant)
    
    try {
      const response = await this.http.request<DeepSeekResponse>('/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.http['config'].apiKey}`
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
      const costUsd = this.calculateCost(model, tokensUsed)

      return {
        suggestion,
        meta: {
          provider: 'deepseek',
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
        `DeepSeek suggest failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'deepseek'
      )
    }
  }

  async chat(args: ChatArgs): Promise<ChatResponse> {
    const { messages, model = 'deepseek-chat', temperature = 0.7, maxTokens = 2000, stream = false } = args
    
    try {
      const response = await this.http.request<DeepSeekResponse>('/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.http['config'].apiKey}`
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
      const costUsd = this.calculateCost(model, tokensUsed)

      return {
        content,
        meta: {
          provider: 'deepseek',
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
        `DeepSeek chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'deepseek'
      )
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.http.request('/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.http['config'].apiKey}`
        }
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
    // DeepSeek pricing per 1K tokens (as of 2024)
    const pricing: Record<string, { input: number, output: number }> = {
      'deepseek-chat': { input: 0.00014, output: 0.00028 },
      'deepseek-coder': { input: 0.00014, output: 0.00028 }
    }
    
    const modelPricing = pricing[model] || pricing['deepseek-chat']
    // Assume 70% input, 30% output tokens for cost estimation
    const inputTokens = Math.floor(tokens * 0.7)
    const outputTokens = Math.floor(tokens * 0.3)
    
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1000
  }
}

interface DeepSeekResponse {
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
