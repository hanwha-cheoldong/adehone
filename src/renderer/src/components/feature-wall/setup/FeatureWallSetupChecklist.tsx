import { normalizeAgentDefaultSurface } from '../../../../../shared/native-chat/settings/native-chat-providers'
import { useCallback, useEffect, useMemo } from 'react'
import { Check } from 'lucide-react'
import type {
  FeatureWallSetupStep,
  FeatureWallSetupStepId
} from '../../../../../shared/feature-education/explore/feature-wall-setup-steps'
import {
  getFeatureWallSetupStepsForSection,
  getFirstIncompleteFeatureWallSetupStepId
} from '../../../../../shared/feature-education/explore/feature-wall-setup-steps'
import { cn } from '@/lib/class-names'
import { Badge } from '@/components/ui/badge'
import { useScrollEdgeFades } from '@/lib/list-interaction/use-scroll-edge-fades'
import type { FeatureWallSetupProgress } from './feature-wall-setup-progress'
import { SetupSection } from './FeatureWallSetupStepList'
import { FullDiskAccessSetupPrompt } from './FullDiskAccessSetupPrompt'
import { AgentCapabilitiesSetupAction } from './agent-capabilities/AgentCapabilitiesSetupAction'
import {
  AddReposAction,
  SetupScriptAction,
  WorkspacesAction
} from './FeatureWallSetupWorkflowActions'
import { MobileBotsSetupAction } from './mobile-bots/MobileBotsSetupAction'
import { ConnectIntegrationsList } from './integrations/ConnectIntegrationsList'
import { BrowserAction } from './browser/FeatureWallBrowserAction'
import {
  SetupBrowserVisual,
  SetupMultipleReposVisual,
  SetupWorkspacesVisual
} from './FeatureWallSetupStepVisuals'
import { AgentStep } from '../../onboarding/AgentStep'
import { useChatAgentDetection } from '../../onboarding/use-onboarding-agent-surface'
import type { AgentSurface } from '../../onboarding/use-onboarding-flow-types'
import { agentSurfaceSettingsUpdate } from '../../onboarding/onboarding-flow-state'
import { onboardingChatPermissionSetting } from '../../onboarding/use-onboarding-flow-persistence'
import { savedYoloPermissions } from '../../onboarding/use-onboarding-yolo-permissions'
import { applyAllAgentsPermission } from '../../../../../shared/agent-launch/permissions/tui-agent-permission-choice'
import { NotificationStep } from '../../onboarding/NotificationStep'
import { useAppStore } from '@/store/index'
import type { TuiAgent } from '../../../../../shared/agent-launch/catalog/tui-agent'
import { getProviderRuntimeContextKey } from '@/runtime/hosts/observations/provider-runtime-context'
import { useTranslate } from '@/i18n/use-translate'

import { getLocalizedFeatureWallSetupChecklistCopy } from './feature-wall-setup-checklist-localized-copy'

type FeatureWallSetupChecklistLayout = 'modal' | 'embedded'

type FeatureWallSetupChecklistProps = {
  activeStep: FeatureWallSetupStep | null
  progress: FeatureWallSetupProgress
  onSelectStep: (id: FeatureWallSetupStepId) => void
  onOrchestrationSkillInstalledChange: (installed: boolean) => void
  onBrowserUseSkillInstalledChange: (installed: boolean) => void
  /** Modal keeps a compact rail; embedded (settings pane) gets more column breathing room. */
  layout?: FeatureWallSetupChecklistLayout
}

function SelectedStepAction(props: FeatureWallSetupChecklistProps): React.JSX.Element | null {
  const { activeStep } = props
  if (!activeStep) {
    return null
  }
  const activeDone = props.progress.stepDone[activeStep.id]
  if (activeStep.id === 'default-agent') {
    return <DefaultAgentAction />
  }
  if (activeStep.id === 'add-two-repos') {
    return <AddReposAction />
  }
  if (activeStep.id === 'notifications') {
    return <NotificationAction />
  }
  if (activeStep.id === 'two-worktrees') {
    return <WorkspacesAction done={activeDone} />
  }
  if (activeStep.id === 'browser') {
    return <BrowserAction done={activeDone} />
  }
  if (activeStep.id === 'task-sources') {
    return <TaskSourcesAction />
  }
  if (activeStep.id === 'agent-capabilities') {
    return (
      <AgentCapabilitiesSetupAction
        onOrchestrationSkillInstalledChange={props.onOrchestrationSkillInstalledChange}
        onBrowserUseSkillInstalledChange={props.onBrowserUseSkillInstalledChange}
      />
    )
  }
  if (activeStep.id === 'setup-script') {
    return <SetupScriptAction />
  }
  if (activeStep.id === 'mobile-dev-bots') {
    return (
      <MobileBotsSetupAction
        done={activeDone}
        onSkip={() =>
          props.onSelectStep(getFirstIncompleteFeatureWallSetupStepId(props.progress.stepDone))
        }
      />
    )
  }
  return null
}

function SelectedStepFooter(props: { stepId: FeatureWallSetupStepId }): React.JSX.Element | null {
  // Why: Full Disk Access matters for projects in protected folders, so it sits with adding projects.
  if (props.stepId === 'add-two-repos') {
    return <FullDiskAccessSetupPrompt />
  }
  return null
}

function SelectedStepVisual(props: { stepId: FeatureWallSetupStepId }): React.JSX.Element | null {
  if (props.stepId === 'two-worktrees') {
    return <SetupWorkspacesVisual />
  }
  if (props.stepId === 'add-two-repos') {
    return <SetupMultipleReposVisual />
  }
  if (props.stepId === 'browser') {
    return <SetupBrowserVisual />
  }
  return null
}

function DefaultAgentAction(): React.JSX.Element {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const detectedAgentIds = useAppStore((s) => s.detectedAgentIds)
  const isDetectingAgents = useAppStore((s) => s.isDetectingAgents || s.isRefreshingAgents)
  const { chatAgents, chatDetected, refreshDetectedAgents } = useChatAgentDetection()
  const selectedAgent =
    settings?.defaultTuiAgent && settings.defaultTuiAgent !== 'blank'
      ? settings.defaultTuiAgent
      : null
  const agentSurface: AgentSurface = normalizeAgentDefaultSurface(settings?.agentDefaultSurface)
  const detectedSet = useMemo(() => new Set(detectedAgentIds ?? []), [detectedAgentIds])
  const handleSelectAgent = useCallback(
    (agent: TuiAgent) => {
      void updateSettings({ defaultTuiAgent: agent })
    },
    [updateSettings]
  )
  // Unlike onboarding, there is no Continue here, so each choice saves as it is made.
  const handleAgentSurfaceChange = (surface: AgentSurface): void => {
    const updates = agentSurfaceSettingsUpdate(settings, surface)
    if (Object.keys(updates).length > 0) {
      void updateSettings(updates)
    }
  }
  const handleYoloPermissionsChange = (enabled: boolean): void => {
    if (!settings) {
      return
    }
    void updateSettings({
      ...applyAllAgentsPermission(settings, enabled ? 'full-access' : 'own'),
      ...onboardingChatPermissionSetting(settings.nativeChatPermissionMode, enabled, true)
    })
  }

  useEffect(() => {
    void refreshDetectedAgents()
  }, [refreshDetectedAgents])

  return (
    <div className="max-w-3xl">
      <AgentStep
        agentSurface={agentSurface}
        onAgentSurfaceChange={handleAgentSurfaceChange}
        agentSurfaceSwitchable
        chatAgents={chatAgents}
        chatDetected={chatDetected}
        nativeChatProviders={settings?.nativeChatProviders}
        selectedAgent={selectedAgent}
        onSelect={handleSelectAgent}
        detectedSet={detectedSet}
        isDetecting={isDetectingAgents}
        yoloPermissions={savedYoloPermissions(settings)}
        onYoloPermissionsChange={handleYoloPermissionsChange}
      />
    </div>
  )
}

function NotificationAction(): React.JSX.Element {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  return (
    <div className="max-w-3xl">
      <NotificationStep settings={settings} updateSettings={updateSettings} />
    </div>
  )
}

function TaskSourcesAction(): React.JSX.Element {
  const refreshPreflightStatus = useAppStore((s) => s.refreshPreflightStatus)
  const checkJiraConnection = useAppStore((s) => s.checkJiraConnection)
  const checkLinearConnection = useAppStore((s) => s.checkLinearConnection)
  const settings = useAppStore((s) => s.settings)
  const providerRuntimeContextKey = getProviderRuntimeContextKey(settings)

  useEffect(() => {
    void refreshPreflightStatus()
    void checkJiraConnection()
    void checkLinearConnection()
  }, [
    refreshPreflightStatus,
    checkJiraConnection,
    checkLinearConnection,
    providerRuntimeContextKey
  ])

  return (
    <div className="space-y-5">
      <ConnectIntegrationsList />
    </div>
  )
}

export function FeatureWallSetupChecklist(
  props: FeatureWallSetupChecklistProps
): React.JSX.Element {
  const t = useTranslate()
  const { activeStep, progress, onSelectStep, layout = 'modal' } = props
  const isEmbedded = layout === 'embedded'
  const activeDone = activeStep ? progress.stepDone[activeStep.id] : false
  // Constrain captions only when they share the row with a visual.
  const hasStepVisual =
    activeStep?.id === 'two-worktrees' ||
    activeStep?.id === 'browser' ||
    activeStep?.id === 'add-two-repos'
  const setupSteps = getFeatureWallSetupStepsForSection('setup')
  const parallelWorkSteps = getFeatureWallSetupStepsForSection('parallel-work')
  const optionalSteps = getFeatureWallSetupStepsForSection('optional')
  const visualBreakpoint = isEmbedded ? 'xl' : 'sm'
  const panelFades = useScrollEdgeFades<HTMLDivElement>()
  const visualGridClass =
    visualBreakpoint === 'xl'
      ? 'gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-12'
      : 'gap-8 sm:grid-cols-[minmax(0,48ch)_auto] sm:gap-10'

  // Switch to the rail sooner so medium-width modals retain usable action space.
  return (
    <div
      className={cn(
        'grid h-full min-h-0',
        isEmbedded
          ? 'grid-rows-[auto_minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(15rem,17rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-16'
          : 'grid-rows-[auto_minmax(0,1fr)] gap-5 md:grid-cols-[minmax(190px,260px)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]'
      )}
    >
      <div
        className={cn(
          'scrollbar-sleek min-h-0 space-y-5 overflow-y-auto',
          isEmbedded ? 'pr-4' : 'max-h-[min(18rem,40vh)] pr-1 md:max-h-none'
        )}
      >
        <SetupSection
          title={t('auto.components.feature.wall.FeatureWallSetupChecklist.1a6a7d6c80', 'Setup')}
          steps={setupSteps}
          startOrdinal={1}
          activeStepId={activeStep?.id ?? null}
          progress={progress}
          onSelectStep={onSelectStep}
        />
        <SetupSection
          title={t(
            'auto.components.feature.wall.FeatureWallSetupChecklist.713cc529a5',
            'Milestones'
          )}
          steps={parallelWorkSteps}
          startOrdinal={setupSteps.length + 1}
          activeStepId={activeStep?.id ?? null}
          progress={progress}
          onSelectStep={onSelectStep}
        />
        <SetupSection
          title={t('setupGuide.optional', 'Optional')}
          uncounted
          steps={optionalSteps}
          startOrdinal={setupSteps.length + parallelWorkSteps.length + 1}
          activeStepId={activeStep?.id ?? null}
          progress={progress}
          onSelectStep={onSelectStep}
        />
      </div>

      <section
        className={cn(
          'flex min-h-0 flex-col',
          isEmbedded
            ? 'pt-10 lg:border-l lg:border-border/50 lg:pl-14 lg:pt-0'
            : 'border-t border-border pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0'
        )}
      >
        {/* Scrolls inside the bordered column so the edge fades leave the divider whole. */}
        <div
          ref={panelFades.ref}
          className={cn('scrollbar-sleek min-h-0 flex-1 overflow-y-auto', panelFades.className)}
        >
          {activeStep ? (
            <div className={cn('flex h-full flex-col', isEmbedded ? 'gap-4' : 'gap-3')}>
              <div className="flex items-center justify-between gap-4">
                <h3 className="min-w-0 text-xl font-semibold tracking-tight text-foreground">
                  {getLocalizedFeatureWallSetupChecklistCopy(activeStep).name}
                </h3>
                {activeStep.optional && !activeDone ? (
                  <Badge variant="outline">{t('setupGuide.optional', 'Optional')}</Badge>
                ) : null}
                {/* Why: a "not done" pill on every open step is noise; only completion is news. */}
                {activeDone ? (
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Check className="size-3.5" />
                    {t('auto.components.feature.wall.FeatureWallSetupChecklist.13294d3405', 'Done')}
                  </span>
                ) : null}
              </div>
              <div
                className={cn(
                  'grid items-start',
                  hasStepVisual ? visualGridClass : 'max-w-3xl gap-5',
                  !hasStepVisual && isEmbedded ? 'max-w-none' : null
                )}
              >
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm leading-relaxed text-muted-foreground',
                      hasStepVisual && !isEmbedded ? 'pr-4 sm:pr-6' : null
                    )}
                  >
                    {getLocalizedFeatureWallSetupChecklistCopy(activeStep).description}
                  </p>
                  {/* Keep actions below the caption so a taller visual cannot push them down. */}
                  <div className={cn('min-w-0', isEmbedded ? 'mt-7' : 'mt-6')}>
                    <SelectedStepAction {...props} />
                  </div>
                </div>
                <SelectedStepVisual stepId={activeStep.id} />
              </div>
              <SelectedStepFooter stepId={activeStep.id} />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
