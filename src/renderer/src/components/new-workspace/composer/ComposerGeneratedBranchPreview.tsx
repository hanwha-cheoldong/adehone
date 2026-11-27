import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  getHostSettingUpdateFailedMessage,
  useHostSetting,
  useSettingsHostLabel
} from '@/components/settings/host-scope/use-host-setting'
import { useTranslate } from '@/i18n/use-translate'
import { useRuntimeEnvironmentCapability } from '@/runtime/rpc/compatibility/use-runtime-environment-capability'
import { runtimeRpcTargetForAuthorityKey } from '@/runtime/rpc/targets/runtime-client-target'
import { useAppStore } from '@/store/index'
import {
  BRANCH_WORK_TYPES,
  parseBranchWorkType,
  type BranchWorkType
} from '../../../../../shared/git/branches/conventional-branch-name'
import { WORKTREE_CREATE_BRANCH_TYPE_RUNTIME_CAPABILITY } from '../../../../../shared/remote-runtime/protocol/worktree-runtime-capabilities'
import type { ExecutionHostId } from '../../../../../shared/execution-host/execution-host'
import {
  isAcceptableTypedBranchName,
  previewGeneratedBranch,
  type GeneratedBranchPreviewInput
} from './generated-branch-preview'

const AUTO_TYPE = 'auto'

export type ComposerGeneratedBranch = Pick<GeneratedBranchPreviewInput, 'name' | 'ticketSource'> & {
  type: BranchWorkType | undefined
  onTypeChange: (value: BranchWorkType | undefined) => void
}

type ComposerGeneratedBranchPreviewProps = {
  repoId: string
  executionHostId: ExecutionHostId | null | undefined
  generatedBranch: ComposerGeneratedBranch
}

/** A typed branch name is used as written, so say before creating when Git would refuse it. */
export function ComposerTypedBranchNameError({
  branchName
}: {
  branchName: string
}): React.JSX.Element | null {
  const t = useTranslate()
  if (isAcceptableTypedBranchName(branchName)) {
    return null
  }
  return (
    <p role="alert" className="text-xs text-destructive">
      {t(
        'components.newWorkspace.generatedBranch.invalidTypedName',
        'Git does not accept this branch name. Edit it before creating.'
      )}
    </p>
  )
}

/** The type picker and the expected name of a branch Adehone generates on the workspace host. */
export function ComposerGeneratedBranchPreview({
  repoId,
  executionHostId,
  generatedBranch: { name, ticketSource, type: branchType, onTypeChange }
}: ComposerGeneratedBranchPreviewProps): React.JSX.Element | null {
  const t = useTranslate()
  const selectId = React.useId()
  const target = (executionHostId ? runtimeRpcTargetForAuthorityKey(executionHostId) : null) ?? {
    kind: 'local' as const
  }
  const environmentId = target.kind === 'environment' ? target.environmentId : null
  const hostSupportsTypes = useRuntimeEnvironmentCapability(
    environmentId,
    WORKTREE_CREATE_BRANCH_TYPE_RUNTIME_CAPABILITY
  )
  const settings = useAppStore((state) => state.settings)
  const localGitUsername = useAppStore(
    (state) => state.repos.find((repo) => repo.id === repoId)?.gitUsername
  )
  const hostLabel = useSettingsHostLabel(target)
  const hostArgs = {
    owner: target,
    localSettings: settings ?? {},
    updateLocalSettings: () => {},
    updateFailedMessage: getHostSettingUpdateFailedMessage(hostLabel, t)
  }
  const strategy = useHostSetting({ ...hostArgs, settingKey: 'branchPrefix' }).setting
  const custom = useHostSetting({ ...hostArgs, settingKey: 'branchPrefixCustom' }).setting

  // An older host names branches its own way, so a preview here would be wrong.
  if (environmentId && !hostSupportsTypes) {
    return null
  }
  const preview =
    strategy.state === 'ready' && custom.state === 'ready'
      ? previewGeneratedBranch({
          name,
          ticketSource,
          type: branchType,
          prefixStrategy: strategy.value,
          customPrefix: custom.value,
          gitUsername: environmentId ? undefined : localGitUsername
        })
      : null

  return (
    <div className="space-y-1" data-slot="generated-branch-preview">
      <label htmlFor={selectId} className="text-xs font-medium text-muted-foreground">
        {t('components.newWorkspace.generatedBranch.type', 'Branch type')}
      </label>
      <Select
        value={branchType ?? AUTO_TYPE}
        onValueChange={(value) => onTypeChange(parseBranchWorkType(value))}
      >
        <SelectTrigger id={selectId} size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AUTO_TYPE}>
            {t('components.newWorkspace.generatedBranch.auto', 'From the name, otherwise feat')}
          </SelectItem>
          {BRANCH_WORK_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {preview?.kind === 'invalid-prefix' ? (
        <p role="alert" className="text-xs text-destructive">
          {t(
            'components.newWorkspace.generatedBranch.invalidPrefix',
            'Git does not accept the branch prefix "{{prefix}}". Change it in Settings → Git.',
            { prefix: preview.prefix }
          )}
        </p>
      ) : preview ? (
        <>
          <p className="text-xs text-muted-foreground">
            {t('components.newWorkspace.generatedBranch.expected', 'Expected branch')}:{' '}
            <span className="font-mono break-all text-foreground">{preview.branch}</span>
          </p>
          {preview.kind === 'random-name' ? (
            <p role="status" className="text-xs text-muted-foreground">
              {t(
                'components.newWorkspace.generatedBranch.randomName',
                'The name has no letters a-z, digits or Hangul and no issue is linked, so the branch is named workspace with a random value chosen at create.'
              )}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
