// The checklist rail: its sections and their step rows.
import { Check } from 'lucide-react'
import type {
  FeatureWallSetupStep,
  FeatureWallSetupStepId
} from '../../../../../shared/feature-education/explore/feature-wall-setup-steps'
import { cn } from '@/lib/class-names'
import type { FeatureWallSetupProgress } from './feature-wall-setup-progress'
import { getLocalizedFeatureWallSetupChecklistCopy } from './feature-wall-setup-checklist-localized-copy'

function SetupStepRow(props: {
  step: FeatureWallSetupStep
  done: boolean
  active: boolean
  ordinal: number
  onSelect: () => void
}): React.JSX.Element {
  const { step, done, active, ordinal, onSelect } = props
  const localizedStepCopy = getLocalizedFeatureWallSetupChecklistCopy(step)
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'step' : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'bg-accent' : 'hover:bg-accent/60'
      )}
    >
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border',
          done
            ? 'border-foreground bg-foreground text-background'
            : 'border-border text-muted-foreground'
        )}
      >
        {done ? (
          <Check className="size-3" strokeWidth={3} />
        ) : (
          <span className="text-[11px] tabular-nums">{ordinal}</span>
        )}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 text-sm leading-snug',
          active
            ? 'font-medium text-foreground'
            : done
              ? 'text-muted-foreground'
              : 'text-foreground'
        )}
      >
        {localizedStepCopy.name}
      </span>
    </button>
  )
}

export function SetupSection(props: {
  title: string
  /** An optional section's steps don't count toward anything, so it shows no tally. */
  uncounted?: boolean
  steps: readonly FeatureWallSetupStep[]
  startOrdinal: number
  activeStepId: FeatureWallSetupStepId | null
  progress: FeatureWallSetupProgress
  onSelectStep: (id: FeatureWallSetupStepId) => void
}): React.JSX.Element {
  const doneCount = props.steps.filter((step) => props.progress.stepDone[step.id]).length
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          {props.title}
        </h4>
        {props.uncounted ? null : (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {doneCount}/{props.steps.length}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        {props.steps.map((step, index) => (
          <SetupStepRow
            key={step.id}
            step={step}
            done={props.progress.stepDone[step.id]}
            active={props.activeStepId === step.id}
            ordinal={props.startOrdinal + index}
            onSelect={() => props.onSelectStep(step.id)}
          />
        ))}
      </div>
    </section>
  )
}
