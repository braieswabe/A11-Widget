import { useState } from 'react'
import './CodeBlock.css'

interface CodeBlockProps {
  code: string
  language?: string
}

export default function CodeBlock({ code, language = 'html' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="code-block">
      <button 
        className="code-block-copy" 
        aria-label="Copy code"
        onClick={handleCopy}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre><code className={language ? `language-${language}` : ''}>{code}</code></pre>
    </div>
  )
}

