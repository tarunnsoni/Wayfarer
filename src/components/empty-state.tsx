import { Compass } from 'lucide-react'
import { Card } from './ui/card'

export function EmptyState() {
  return (
    <Card className="p-10 sm:p-14 bg-gradient-card border-dashed border-border/70 text-center">
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
