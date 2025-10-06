'use client'

import { useState } from 'react'
import { ModelBadge } from '@/components/ui/model-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

const ALL_MODELS = [
  'GPT',
  'Claude', 
  'Gemini',
  'Gemma',
  'Grok',
  'Perplexity',
  'GitHub',
  'Copilot',
  'Mistral',
  'Meta',
  'Ollama',
  'Cohere',
  'Qwen',
  'DeepSeek',
  'Moonshot',
  'Black Forest Labs',
  'Other'
] as const

export default function ModelBadgeDemo() {
  const [showIcons, setShowIcons] = useState(true)
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg'>('sm')
  const [selectedVariant, setSelectedVariant] = useState<'filled' | 'outline' | 'transparent'>('filled')
  const [clickable, setClickable] = useState(false)
  const [removable, setRemovable] = useState(false)

  const handleModelClick = (model: string) => {
    alert(`Clicked on ${model} model badge!`)
  }

  const handleModelRemove = (model: string) => {
    alert(`Remove ${model} model badge!`)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Model Badge Demo</h1>
          <p className="text-xl text-muted-foreground">
            Visual showcase of all AI model badges with different configurations
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Controls</CardTitle>
            <CardDescription>
              Customize the appearance and behavior of the model badges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-icons"
                  checked={showIcons}
                  onChange={setShowIcons}
                />
                <label htmlFor="show-icons" className="text-sm font-medium">
                  Show Icons
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="clickable"
                  checked={clickable}
                  onChange={setClickable}
                />
                <label htmlFor="clickable" className="text-sm font-medium">
                  Clickable
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="removable"
                  checked={removable}
                  onChange={setRemovable}
                />
                <label htmlFor="removable" className="text-sm font-medium">
                  Removable
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Size</label>
                <div className="flex space-x-2">
                  {(['sm', 'md', 'lg'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Variant</label>
                <div className="flex flex-wrap gap-2">
                  {(['filled', 'outline', 'transparent'] as const).map((variant) => (
                    <Button
                      key={variant}
                      variant={selectedVariant === variant ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Models Grid */}
        <Card>
          <CardHeader>
            <CardTitle>All Models ({ALL_MODELS.length})</CardTitle>
            <CardDescription>
              Complete list of supported AI models with current configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {ALL_MODELS.map((model) => (
                <div key={model} className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
                  <ModelBadge
                    model={model}
                    showIcon={showIcons}
                    size={selectedSize}
                    variant={selectedVariant}
                    onClick={clickable ? () => handleModelClick(model) : undefined}
                    onRemove={removable ? () => handleModelRemove(model) : undefined}
                    showRemove={removable}
                    className="mb-2"
                  />
                  <span className="text-xs text-muted-foreground text-center">
                    {model}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Size Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Size Comparison</CardTitle>
            <CardDescription>
              See how the same model looks in different sizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <div key={size} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{size.toUpperCase()}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {size === 'sm' && 'Compact size for tight spaces'}
                      {size === 'md' && 'Standard size for most use cases'}
                      {size === 'lg' && 'Large size for emphasis'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['GPT', 'Claude', 'Gemini', 'Grok'].map((model) => (
                      <ModelBadge
                        key={model}
                        model={model}
                        showIcon={showIcons}
                        size={size}
                        variant={selectedVariant}
                        onClick={clickable ? () => handleModelClick(model) : undefined}
                        onRemove={removable ? () => handleModelRemove(model) : undefined}
                        showRemove={removable}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Examples</CardTitle>
            <CardDescription>
              Real-world usage scenarios for model badges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filter Tags */}
            <div className="space-y-3">
              <h4 className="font-medium">Filter Tags (Clickable)</h4>
              <div className="flex flex-wrap gap-2">
                {['GPT', 'Claude', 'Gemini', 'Grok', 'Perplexity'].map((model) => (
                  <ModelBadge
                    key={model}
                    model={model}
                    showIcon={true}
                    size="sm"
                    variant={selectedVariant}
                    onClick={() => handleModelClick(model)}
                    className="cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            </div>

            {/* Selected Models */}
            <div className="space-y-3">
              <h4 className="font-medium">Selected Models (Removable)</h4>
              <div className="flex flex-wrap gap-2">
                {['GPT', 'Claude', 'Gemini'].map((model) => (
                  <ModelBadge
                    key={model}
                    model={model}
                    showIcon={true}
                    size="sm"
                    variant={selectedVariant}
                    onRemove={() => handleModelRemove(model)}
                    showRemove={true}
                    className="bg-primary text-primary-foreground"
                  />
                ))}
              </div>
            </div>

            {/* Mixed Usage */}
            <div className="space-y-3">
              <h4 className="font-medium">Mixed Usage</h4>
              <div className="flex flex-wrap gap-2">
                <ModelBadge model="GPT" showIcon={true} size="md" variant={selectedVariant} />
                <ModelBadge 
                  model="Claude" 
                  showIcon={true} 
                  size="md" 
                  variant={selectedVariant}
                  onClick={() => handleModelClick('Claude')}
                  className="cursor-pointer"
                />
                <ModelBadge 
                  model="Gemini" 
                  showIcon={true} 
                  size="md" 
                  variant={selectedVariant}
                  onRemove={() => handleModelRemove('Gemini')}
                  showRemove={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>
              Code snippets for different badge configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Basic Usage</h4>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`<ModelBadge model="GPT" showIcon={true} size="sm" variant="filled" />`}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Clickable Badge</h4>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`<ModelBadge 
  model="Claude" 
  showIcon={true} 
  size="md"
  variant="filled"
  onClick={() => handleModelClick('Claude')}
/>`}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Removable Badge</h4>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`<ModelBadge 
  model="Gemini" 
  showIcon={true} 
  size="sm"
  variant="filled"
  onRemove={() => handleModelRemove('Gemini')}
  showRemove={true}
/>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
