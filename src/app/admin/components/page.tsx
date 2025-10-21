'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Palette, 
  Code, 
  Eye, 
  Copy,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { useState } from 'react'

export default function ComponentsPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const components = [
    {
      name: 'Button',
      description: 'Primary action button',
      code: `<Button>Click me</Button>`,
      variants: [
        { name: 'Default', code: `<Button>Default</Button>` },
        { name: 'Secondary', code: `<Button variant="secondary">Secondary</Button>` },
        { name: 'Outline', code: `<Button variant="outline">Outline</Button>` },
        { name: 'Ghost', code: `<Button variant="ghost">Ghost</Button>` },
        { name: 'Destructive', code: `<Button variant="destructive">Destructive</Button>` }
      ]
    },
    {
      name: 'Card',
      description: 'Content container with header and body',
      code: `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>`,
      variants: []
    },
    {
      name: 'Badge',
      description: 'Small status indicator',
      code: `<Badge>Badge</Badge>`,
      variants: [
        { name: 'Default', code: `<Badge>Default</Badge>` },
        { name: 'Secondary', code: `<Badge variant="secondary">Secondary</Badge>` },
        { name: 'Outline', code: `<Badge variant="outline">Outline</Badge>` },
        { name: 'Destructive', code: `<Badge variant="destructive">Destructive</Badge>` }
      ]
    },
    {
      name: 'Input',
      description: 'Text input field',
      code: `<Input placeholder="Enter text..." />`,
      variants: [
        { name: 'Default', code: `<Input placeholder="Enter text..." />` },
        { name: 'With Label', code: `<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>` },
        { name: 'Disabled', code: `<Input disabled placeholder="Disabled" />` }
      ]
    },
    {
      name: 'Textarea',
      description: 'Multi-line text input',
      code: `<Textarea placeholder="Enter message..." />`,
      variants: [
        { name: 'Default', code: `<Textarea placeholder="Enter message..." />` },
        { name: 'With Rows', code: `<Textarea rows={4} placeholder="Enter message..." />` }
      ]
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Component Library</h1>
        <p className="text-gray-600 mt-2">UI components showcase and testing</p>
      </div>

      <div className="space-y-8">
        {components.map((component) => (
          <Card key={component.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {component.name}
              </CardTitle>
              <CardDescription>{component.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Usage */}
              <div>
                <h4 className="font-medium mb-3">Basic Usage</h4>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <pre className="flex-1 text-sm">{component.code}</pre>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(component.code, `basic-${component.name}`)}
                  >
                    {copied === `basic-${component.name}` ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Variants */}
              {component.variants.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Variants</h4>
                  <div className="space-y-3">
                    {component.variants.map((variant, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="w-24">
                          <Badge variant="outline">{variant.name}</Badge>
                        </div>
                        <pre className="flex-1 text-sm">{variant.code}</pre>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(variant.code, `variant-${component.name}-${index}`)}
                        >
                          {copied === `variant-${component.name}-${index}` ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview */}
              <div>
                <h4 className="font-medium mb-3">Live Preview</h4>
                <div className="p-4 border rounded-lg bg-white">
                  {component.name === 'Button' && (
                    <div className="flex gap-2 flex-wrap">
                      <Button>Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                    </div>
                  )}
                  {component.name === 'Card' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Example Card</CardTitle>
                        <CardDescription>This is a card component preview</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>This is the card content area.</p>
                      </CardContent>
                    </Card>
                  )}
                  {component.name === 'Badge' && (
                    <div className="flex gap-2 flex-wrap">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>
                  )}
                  {component.name === 'Input' && (
                    <div className="space-y-2">
                      <Input placeholder="Enter text..." />
                      <Input disabled placeholder="Disabled input" />
                    </div>
                  )}
                  {component.name === 'Textarea' && (
                    <Textarea placeholder="Enter message..." rows={3} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Usage Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Consistent Styling</h4>
                <p className="text-sm text-gray-600">All components follow the same design system</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Accessible</h4>
                <p className="text-sm text-gray-600">Built with accessibility in mind</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Responsive</h4>
                <p className="text-sm text-gray-600">Works on all screen sizes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Customizable</h4>
                <p className="text-sm text-gray-600">Easy to customize with props</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
