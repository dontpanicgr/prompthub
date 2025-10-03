'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Star,
  Heart,
  Download,
  Upload,
  Settings,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react'

export default function UIDemoPage() {
  const [switchState, setSwitchState] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <a href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
            </a>
          </div>
          <h1 className="text-4xl font-bold mb-2">UI Components Demo</h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive showcase of all UI components and design system elements
          </p>
        </div>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Typography</h2>
          <Card>
            <CardHeader>
              <CardTitle>Text Styles</CardTitle>
              <CardDescription>Different text sizes, weights, and styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold">Heading 1 - 4xl Bold</h1>
                  <p className="text-sm text-muted-foreground">Used for main page titles</p>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold">Heading 2 - 3xl Semibold</h2>
                  <p className="text-sm text-muted-foreground">Used for section titles</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Heading 3 - 2xl Semibold</h3>
                  <p className="text-sm text-muted-foreground">Used for subsection titles</p>
                </div>
                <div>
                  <h4 className="text-xl font-medium">Heading 4 - xl Medium</h4>
                  <p className="text-sm text-muted-foreground">Used for card titles</p>
                </div>
                <div>
                  <p className="text-base">Body text - base size</p>
                  <p className="text-sm text-muted-foreground">Small text - sm size</p>
                  <p className="text-xs text-muted-foreground">Extra small text - xs size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>Different button styles and states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled>Disabled</Button>
                  <Button variant="outline" disabled>Disabled Outline</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button with Icons</CardTitle>
                <CardDescription>Buttons with various icon combinations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>
                    <Check className="h-4 w-4 mr-2" />
                    Success
                  </Button>
                  <Button variant="destructive">
                    <X className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>Simple card with header and content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a basic card component with header, description, and content area.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Featured Card
                </CardTitle>
                <CardDescription>Card with icon in the title</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This card demonstrates how to include icons in the title.
                </p>
                <Button size="sm" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Alert Card</CardTitle>
                <CardDescription>Card with destructive styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card uses destructive colors to indicate an important message.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Badges</h2>
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>Different badge styles and colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Default Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Status Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Warning
                  </Badge>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <X className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Info className="h-3 w-3 mr-1" />
                    Info
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Elements */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Input Fields</CardTitle>
                <CardDescription>Various input field types and states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Default Input</label>
                  <Input placeholder="Enter text here..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Input with Icon</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Disabled Input</label>
                  <Input placeholder="Disabled input" disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select & Switch</CardTitle>
                <CardDescription>Dropdown and toggle components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Dropdown</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="demo-switch"
                    checked={switchState}
                    onCheckedChange={setSwitchState}
                  />
                  <label htmlFor="demo-switch" className="text-sm font-medium">
                    Toggle switch: {switchState ? 'On' : 'Off'}
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Alerts */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Alerts</h2>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is an informational alert with default styling.
              </AlertDescription>
            </Alert>
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                This is a success alert with green styling.
              </AlertDescription>
            </Alert>
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                This is a warning alert with yellow styling.
              </AlertDescription>
            </Alert>
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <X className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                This is an error alert with red styling.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Interactive Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Action Buttons</CardTitle>
                <CardDescription>Common button patterns and interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Indicators</CardTitle>
                <CardDescription>Various status and state indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  <Badge variant="secondary">Pending</Badge>
                  <Badge variant="destructive">Failed</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Draft</Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Published
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>Code snippets for common component patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Button with Icon</h4>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`<Button>
  <Check className="h-4 w-4 mr-2" />
  Success
</Button>`}
              </pre>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Status Badge</h4>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`<Badge className="bg-green-100 text-green-800">
  <CheckCircle className="h-3 w-3 mr-1" />
  Success
</Badge>`}
              </pre>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Card with Actions</h4>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <Button className="w-full">Action</Button>
  </CardContent>
</Card>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
