import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState, useRef, useEffect } from 'react'
import { TripMarkdown } from '@/components/trip-markdown'
import { DEFAULT_TRIP_BUDGET } from '@/lib/travel-currency'
import { toast } from 'sonner'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { planTrip } from '@/lib/services/ai.service'
import {
  Compass,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Sparkles,
  Plane,
  Loader2,
  MessageCircle,
  Send,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Wayfarer — AI Travel Itineraries' },
      {
        name: 'description',
        content:
          'Plan beautiful, personalized trips in seconds. Tell us where, when, and what you love — get a day-by-day itinerary.',
      },
      { property: 'og:title', content: 'Wayfarer — AI Travel Itineraries' },
      {
        property: 'og:description',
        content:
          'Personalized AI trip plans with day-by-day itineraries, stays, food and budgets.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Index,
})

type Form = {
  source: string
  destination: string
  startDate: string
  endDate: string
  budget: string
  travelers: number
  interests: string
}

function Index() {
  const plan = useServerFn(planTrip)
  const [form, setForm] = useState<Form>({
    source: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: DEFAULT_TRIP_BUDGET,
    travelers: 2,
    interests: '',
  })
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<string | null>(null)

  const update = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.source || !form.destination || !form.startDate || !form.endDate) {
      toast.error('Please fill in source, destination and dates.')
      return
    }
    setLoading(true)
    setItinerary(null)
    try {
      const res = await plan({ data: form })
      setItinerary(res.itinerary)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      if (msg.includes('429'))
        toast.error('Rate limit reached. Please try again shortly.')
      else if (msg.includes('402'))
        toast.error(
          'AI credits exhausted. Please add credits in your workspace.',
        )
      else toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-center" />

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-hero">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, oklch(0.95 0.05 200 / 0.5), transparent 40%), radial-gradient(circle at 80% 60%, oklch(0.85 0.15 30 / 0.4), transparent 45%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-8 sm:px-6 sm:pt-24 sm:pb-20">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
            <Compass className="h-4 w-4" />
            <span>Wayfarer</span>
          </div>
          <h1 className="mt-5 font-display text-4xl sm:text-7xl text-foreground leading-[1.1] sm:leading-[1.02]">
            Plan a trip you'll{' '}
            <em className="text-primary not-italic">actually</em> remember.
          </h1>
          <p className="mt-5 max-w-xl text-base sm:text-lg text-foreground/70">
            Tell us where you're going and what makes you tick. Our AI weaves it
            into a day-by-day itinerary stays, food, neighborhoods, budgets
            and all.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12 grid lg:grid-cols-5 gap-6 sm:gap-8">
        {/* Form */}
        <Card className="min-w-0 lg:col-span-2 p-4 sm:p-8 bg-gradient-card border-border/60 shadow-soft h-fit lg:sticky lg:top-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="flex items-center gap-2 text-primary">
              <Plane className="h-5 w-5" />
              <h2 className="font-display text-2xl text-foreground">
                Your trip
              </h2>
            </div>

            <Field icon={<MapPin className="h-4 w-4" />} label="From">
              <Input
                value={form.source}
                onChange={(e) => update('source', e.target.value)}
                placeholder="Mumbai"
              />
            </Field>
            <Field icon={<MapPin className="h-4 w-4" />} label="To">
              <Input
                value={form.destination}
                onChange={(e) => update('destination', e.target.value)}
                placeholder="Lisbon"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field icon={<Calendar className="h-4 w-4" />} label="Start">
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                />
              </Field>
              <Field icon={<Calendar className="h-4 w-4" />} label="End">
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => update('endDate', e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field icon={<Wallet className="h-4 w-4" />} label="Budget (INR)">
                <div className="relative min-w-0">
                  <span
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  >
                    ₹
                  </span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    required
                    value={form.budget}
                    onChange={(e) => update('budget', e.target.value)}
                    placeholder="15000"
                    aria-label="Total budget in Indian rupees"
                    className="pl-7"
                  />
                </div>
              </Field>
              <Field icon={<Users className="h-4 w-4" />} label="Travelers">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={form.travelers}
                  onChange={(e) =>
                    update(
                      'travelers',
                      Math.max(1, Number(e.target.value) || 1),
                    )
                  }
                />
              </Field>
            </div>

            <Field icon={<Sparkles className="h-4 w-4" />} label="Interests">
              <Textarea
                value={form.interests}
                onChange={(e) => update('interests', e.target.value)}
                placeholder="street food, jazz, coastal walks, slow mornings…"
                rows={3}
              />
            </Field>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Crafting
                  your trip…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Plan my trip
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Output */}
        <section
          className="min-w-0 lg:col-span-3"
          aria-live="polite"
          aria-busy={loading}
        >
          {!itinerary && !loading && <EmptyState />}
          {loading && <LoadingState />}
          {itinerary && (
            <>
              <Card className="min-w-0 p-4 sm:p-10 bg-card border-border/60 shadow-soft">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-accent" /> Your
                  itinerary
                </div>
                <article className="itinerary-prose">
                  <TripMarkdown>{itinerary}</TripMarkdown>
                </article>
              </Card>
              <TripChat key={itinerary} itinerary={itinerary} />
            </>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-center text-xs text-muted-foreground">
        Crafted with AI · itineraries are suggestions double-check opening
        hours and bookings.
      </footer>
    </div>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-medium">
        <span className="text-primary/70">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="min-w-0 p-5 sm:p-14 bg-gradient-card border-dashed border-border/70 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <Compass className="h-7 w-7 text-primary" />
      </div>
      <h3 className="font-display text-3xl text-foreground">
        Your next adventure awaits
      </h3>
      <p className="mt-3 text-muted-foreground max-w-md mx-auto">
        Fill the form and we'll handcraft a day-by-day plan tuned to your dates,
        budget and the kind of traveler you are.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
        {['Day-by-day plan', 'Stay & food', 'Budget table'].map((t) => (
          <div
            key={t}
            className="rounded-xl bg-card/60 border border-border/60 py-3 px-2 text-xs font-medium text-foreground/70"
          >
            {t}
          </div>
        ))}
      </div>
    </Card>
  )
}

function LoadingState() {
  return (
    <Card className="min-w-0 p-5 sm:p-10 bg-gradient-card border-border/60 shadow-soft">
      <div className="flex items-center gap-3 text-primary">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-display text-xl">Mapping your route…</span>
      </div>
      <div className="mt-6 space-y-3">
        {[90, 75, 85, 60, 80].map((w, i) => (
          <div key={i} className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/40 to-accent/40 animate-pulse"
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Picking neighborhoods, balancing the budget, and finding the good food
        spots.
      </p>
    </Card>
  )
}

function TripChat({ itinerary }: { itinerary: string }) {
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
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (error) {
      const msg = error.message || 'Chat failed'
      if (msg.includes('429'))
        toast.error('Rate limit reached. Try again shortly.')
      else if (msg.includes('402')) toast.error('AI credits exhausted.')
      else toast.error(msg)
    }
  }, [error])

  const onSend = async (e: React.FormEvent) => {
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
    <Card className="mt-6 min-w-0 p-4 sm:p-8 bg-gradient-card border-border/60 shadow-soft">
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

      <div
        ref={scrollRef}
        className="min-w-0 max-h-[440px] overflow-y-auto space-y-4 pr-1"
      >
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Button
                key={s}
                type="button"
                onClick={() => sendMessage({ text: s })}
                disabled={isLoading}
                variant="outline"
                className="h-auto min-h-11 max-w-full whitespace-normal text-left text-xs border-border/70 bg-card/60 px-3 py-2 text-foreground/70 hover:text-foreground hover:border-primary/40"
              >
                {s}
              </Button>
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
              className={`flex min-w-0 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={
                  isUser
                    ? 'min-w-0 max-w-[85%] break-words rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm shadow-sm'
                    : 'min-w-0 w-full text-sm text-foreground'
                }
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                ) : (
                  <article className="itinerary-prose prose-sm">
                    <TripMarkdown>{text}</TripMarkdown>
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

      <form
        onSubmit={onSend}
        className="mt-5 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2"
      >
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
          className="min-w-0 resize-none min-h-[44px] max-h-32"
          aria-label="Ask about your trip"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
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
