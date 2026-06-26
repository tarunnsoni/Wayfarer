import { Label } from './ui/label'

export function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-medium">
        <span className="text-primary/70">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  )
}
