import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
} from 'lucide-react'
import { EmptyState, Field, LoadingState, TripChat } from '@/components'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Wayfarer | AI Travel Itineraries' },
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
    budget: '$1500',
    travelers: 2,
    interests: '',
  })
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<string | null>(null)

  const update = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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
        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-12 sm:pt-24 sm:pb-20">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
            <Compass className="h-4 w-4" />
            <span>Wayfarer</span>
          </div>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl text-foreground leading-[1.02]">
            Plan a trip you'll{' '}
            <em className="text-primary not-italic">actually</em> remember.
          </h1>
          <p className="mt-5 max-w-xl text-base sm:text-lg text-foreground/70">
            Tell us where you're going and what makes you tick. Our AI weaves it
            into a day-by-day itinerary — stays, food, neighborhoods, budgets
            and all.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <Card className="lg:col-span-2 p-6 sm:p-8 bg-gradient-card border-border/60 shadow-soft h-fit lg:sticky lg:top-6">
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
              <Field icon={<Wallet className="h-4 w-4" />} label="Budget">
                <Input
                  value={form.budget}
                  onChange={(e) => update('budget', e.target.value)}
                  placeholder="$1500"
                />
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
        <section className="lg:col-span-3">
          {!itinerary && !loading && <EmptyState />}
          {loading && <LoadingState />}
          {itinerary && (
            <>
              <Card className="p-6 sm:p-10 bg-card border-border/60 shadow-soft">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-accent" /> Your
                  itinerary
                </div>
                <article className="itinerary-prose">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-2 hover:opacity-80"
                        />
                      ),
                    }}
                  >
                    {itinerary}
                  </ReactMarkdown>
                </article>
              </Card>
              <TripChat itinerary={itinerary} />
            </>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-center text-xs text-muted-foreground">
        Crafted with AI · itineraries are suggestions — double-check opening
        hours and bookings.
      </footer>
    </div>
  )
}
