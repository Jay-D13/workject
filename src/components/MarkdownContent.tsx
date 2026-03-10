import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

interface MarkdownContentProps {
  value: string
}

export function MarkdownContent({ value }: MarkdownContentProps) {
  return (
    <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
      {value}
    </Markdown>
  )
}
