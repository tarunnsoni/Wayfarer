import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Card } from './ui/card'
import { Loader2, MessageCircle, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'

export function TripChat({ itinerary }: { itinerary: string }) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { tripContext: itinerary },
    }),
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, status])

  useEffect(() => {
    if (error) {
      const msg = error.message || 'Chat failed'
      if (msg.includes('429'))
        toast.error('Rate limit reached. Try again shortly.')
      else if (msg.includes('402')) toast.error('AI credits exhausted.')
      else toast.error(msg)
    }
  }, [error])

  const onSend = async (
    e:
      | React.SyntheticEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    await sendMessage({ text })
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const suggestions = [
    'Swap day 2 for something more relaxed',
    'Best vegetarian food spots?',
    'Is this budget realistic?',
    'What should I pack?',
  ]

  return (
    <Card className="mt-6 p-6 sm:p-8 bg-gradient-card border-border/60 shadow-soft">
      <div className="flex items-center gap-2 mb-1 text-primary">
        <MessageCircle className="h-5 w-5" />
        <h3 className="font-display text-2xl text-foreground">
          Ask about your trip
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Chat with the AI to refine the itinerary, swap activities, or get local
        tips.
      </p>

      <div ref={scrollRef} className="max-h-110 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage({ text: s })}
                disabled={isLoading}
                className="text-xs rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-foreground/70 hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === 'text' ? p.text : ''))
            .join('')
          const isUser = m.role === 'user'
          return (
            <div
              key={m.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={
                  isUser
                    ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm shadow-sm'
                    : 'max-w-[90%] text-sm text-foreground'
                }
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                ) : (
                  <article className="itinerary-prose prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {text}
                    </ReactMarkdown>
                  </article>
                )}
              </div>
            </div>
          )
        })}

        {status === 'submitted' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </div>
        )}
      </div>

      <form onSubmit={onSend} className="mt-5 flex items-end gap-2">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend(e)
            }
          }}
          placeholder="Ask anything about your trip…"
          rows={1}
          className="resize-none min-h-11 max-h-32"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="h-11 w-11 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Card>
  )
}
