import { Loader2 } from 'lucide-react'
import { Card } from './ui/card'

export function LoadingState() {
  return (
    <Card className="p-10 bg-gradient-card border-border/60 shadow-soft">
      <div className="flex items-center gap-3 text-primary">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-display text-xl">Mapping your route…</span>
      </div>
      <div className="mt-6 space-y-3">
        {[90, 75, 85, 60, 80].map((w, i) => (
          <div key={i} className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary/40 to-accent/40 animate-pulse"
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
