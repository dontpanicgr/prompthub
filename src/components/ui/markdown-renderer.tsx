'use client'

import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import Tooltip from '@/components/ui/tooltip'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize link behavior for mentions
          a: ({ href, children, ...props }) => {
            // Check if it's a mention link
            if (href?.startsWith('@')) {
              const username = href.substring(1)
              return (
                <a
                  href={`/user/${username}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                  {...props}
                >
                  {children}
                </a>
              )
            }
            // Regular links
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
                {...props}
              >
                {children}
              </a>
            )
          },
          // Style code blocks
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className="bg-secondary px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          // Style pre blocks (code areas) and add hover copy button
          pre: ({ children, ...props }) => {
            const preRef = useRef<HTMLPreElement | null>(null)
            const [copied, setCopied] = useState(false)

            const handleCopy = async () => {
              if (!preRef.current) return
              const textToCopy = preRef.current.innerText
              try {
                await navigator.clipboard.writeText(textToCopy)
                setCopied(true)
                setTimeout(() => setCopied(false), 1200)
              } catch {
                // no-op
              }
            }

            return (
              <div className="group relative mt-2 mb-2">
                <Tooltip content="Copy code">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute right-2 top-2 z-10 rounded-sm border bg-background/80 px-2 py-1 text-xs opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    aria-label="Copy code"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </Tooltip>
                <pre ref={preRef} className="bg-secondary rounded-sm" {...props}>
                  {children}
                </pre>
              </div>
            )
          },
          // Style blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-primary p-4 italic" {...props}>
              {children}
            </blockquote>
          ),
          // Style headings
          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold mb-1" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-semibold mb-1" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-semibold mb-1" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-base font-semibold mb-1" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-sm font-semibold mb-1" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-xs font-semibold mb-1" {...props}>
              {children}
            </h6>
          ),
          // Style paragraphs
          p: ({ children, ...props }) => (
            <p className="mb-1" {...props}>
              {children}
            </p>
          ),
          // Style lists
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside space-y-1 mb-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 mb-1" {...props}>
              {children}
            </ol>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}