// Model registry mapping friendly names to providers and capabilities
// File: src/lib/model-registry.ts

export interface ModelInfo {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'deepseek' | 'openai_compatible'
  capabilities: {
    suggest: boolean
    chat: boolean
  }
  maxTokens: number
  inputFormat: 'text' | 'markdown' | 'json'
  outputFormat: 'text' | 'markdown' | 'json'
  costPer1kTokens?: {
    input: number
    output: number
  }
  description?: string
  isManaged?: boolean // true if we provide the key
}

export const MODEL_REGISTRY: Record<string, ModelInfo> = {
  // OpenAI Models
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    capabilities: { suggest: true, chat: true },
    maxTokens: 128000,
    inputFormat: 'text',
    outputFormat: 'text',
    costPer1kTokens: { input: 0.005, output: 0.015 },
    description: 'Most capable GPT-4 model with vision',
    isManaged: true
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    capabilities: { suggest: true, chat: true },
    maxTokens: 128000,
    inputFormat: 'text',
    outputFormat: 'text',
    costPer1kTokens: { input: 0.00015, output: 0.0006 },
    description: 'Fast and efficient GPT-4 model',
    isManaged: true
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    capabilities: { suggest: true, chat: true },
    maxTokens: 128000,
    inputFormat: 'text',
    outputFormat: 'text',
    costPer1kTokens: { input: 0.01, output: 0.03 },
    description: 'High-performance GPT-4 model',
    isManaged: true
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    capabilities: { suggest: true, chat: true },
    maxTokens: 16385,
    inputFormat: 'text',
    outputFormat: 'text',
    costPer1kTokens: { input: 0.0015, output: 0.002 },
    description: 'Fast and cost-effective model',
    isManaged: true
  },

  // Anthropic Models
  'claude-3-opus': {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    capabilities: { suggest: true, chat: true },
    maxTokens: 200000,
    inputFormat: 'text',
    outputFormat: 'text',
    costPer1kTokens: { input: 0.015, output: 0.075 },
    description: 'Most capable Claude model',
    isManaged: true
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    capabilities: { suggest: true, chat: true },
    maxTokens: 200000,
    inputFormat: 'text',
    outputFormat: 'text',
    costPer1kTokens: { input: 0.003, output: 0.015 },
    description: 'Balanced performance and cost',
    isManaged: true
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    capabilities: { suggest: true, chat: true },
    maxTokens: 200000,
    inputFormat: 'text',
    outputFormat: 'text',
    costPer1kTokens: { input: 0.00025, output: 0.00125 },
    description: 'Fast and efficient Claude model',
    isManaged: true
  },

  // DeepSeek Models
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    capabilities: { suggest: true, chat: true },
    maxTokens: 32000,
    inputFormat: 'text',
    outputFormat: 'text',
    costPer1kTokens: { input: 0.00014, output: 0.00028 },
    description: 'High-quality reasoning and coding',
    isManaged: true
  },
  'deepseek-coder': {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    capabilities: { suggest: true, chat: true },
    maxTokens: 16000,
    inputFormat: 'text',
    outputFormat: 'text',
    costPer1kTokens: { input: 0.00014, output: 0.00028 },
    description: 'Specialized for coding tasks',
    isManaged: true
  },

  // OpenAI-Compatible Models (BYOM)
  'llama2': {
    id: 'llama2',
    name: 'Llama 2',
    provider: 'openai_compatible',
    capabilities: { suggest: true, chat: true },
    maxTokens: 4096,
    inputFormat: 'text',
    outputFormat: 'text',
    description: 'Open source model via Ollama/OpenRouter',
    isManaged: false
  },
  'codellama': {
    id: 'codellama',
    name: 'Code Llama',
    provider: 'openai_compatible',
    capabilities: { suggest: true, chat: true },
    maxTokens: 16384,
    inputFormat: 'text',
    outputFormat: 'text',
    description: 'Code-specialized Llama model',
    isManaged: false
  },
  'mistral': {
    id: 'mistral',
    name: 'Mistral 7B',
    provider: 'openai_compatible',
    capabilities: { suggest: true, chat: true },
    maxTokens: 32768,
    inputFormat: 'text',
    outputFormat: 'text',
    description: 'Efficient open source model',
    isManaged: false
  },
  'neural-chat': {
    id: 'neural-chat',
    name: 'Neural Chat',
    provider: 'openai_compatible',
    capabilities: { suggest: true, chat: true },
    maxTokens: 4096,
    inputFormat: 'text',
    outputFormat: 'text',
    description: 'Intel Neural Chat model',
    isManaged: false
  }
}

// Helper functions
export function getModelInfo(modelId: string): ModelInfo | null {
  return MODEL_REGISTRY[modelId] || null
}

export function getModelsByProvider(provider: string): ModelInfo[] {
  return Object.values(MODEL_REGISTRY).filter(model => model.provider === provider)
}

export function getModelsByCapability(capability: 'suggest' | 'chat'): ModelInfo[] {
  return Object.values(MODEL_REGISTRY).filter(model => model.capabilities[capability])
}

export function getManagedModels(): ModelInfo[] {
  return Object.values(MODEL_REGISTRY).filter(model => model.isManaged)
}

export function getBYOMModels(): ModelInfo[] {
  return Object.values(MODEL_REGISTRY).filter(model => !model.isManaged)
}

// Default model suggestions by use case
export const DEFAULT_MODELS = {
  suggest: 'gpt-4o-mini', // Fast and cost-effective for suggestions
  chat: 'claude-3-haiku', // Good balance for chat
  coding: 'deepseek-coder', // Specialized for code
  creative: 'gpt-4o', // Best for creative tasks
  analysis: 'claude-3-sonnet' // Good for analysis
}

// Model validation
export function validateModel(modelId: string, capability: 'suggest' | 'chat'): boolean {
  const model = getModelInfo(modelId)
  return model ? model.capabilities[capability] : false
}

export function getModelDisplayName(modelId: string): string {
  const model = getModelInfo(modelId)
  return model ? model.name : modelId
}
