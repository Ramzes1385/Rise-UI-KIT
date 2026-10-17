import { warn } from '@/locales/warn'
import { UI_FLOW_MAP } from '@/locales/messages'
import { validateFlowData } from '../data/flowValidate'
import { hookFailedMessage } from '../controller/flowEvents'
import type { FlowMapData } from '../../types/data/flowData.types'
import type { FlowChange } from '../../types/data/flowReview.types'
import { applyFlowChanges, invertFlowChanges } from '../data/flowChanges'
import { hookNameOf, hookReject, limitReject, refuse } from './flowReject'
import type { FlowCommand, FlowModel } from '../../types/internal/flowModel.types'
import type { FlowExecContext } from '../../types/internal/core/flowModelCore.types'
import type { FlowCommandResult, FlowRejectEvent } from '../../types/api/flowController.types'

const STRUCTURAL_KEYS = ['group', 'parent', 'source', 'target', 'sourcePort', 'targetPort', 'kind', 'ports', 'notation']

function isStructural(changes: readonly FlowChange[]): boolean {
	return changes.some(change => change.type !== 'update' || Object.keys(change.patch).some(key => STRUCTURAL_KEYS.includes(key)))
}

function errorKeys(data: FlowMapData, ctx: FlowExecContext): Set<string> {
	const { notation, registry } = ctx.state
	return new Set(
		validateFlowData(data, notation.value, registry.value)
			.filter(issue => issue.level === 'error')
			.map(issue => `${issue.code}|${issue.target?.entity ?? ''}:${issue.target?.id ?? ''}`),
	)
}

function introducesErrors(ctx: FlowExecContext, before: FlowMapData, next: FlowMapData): boolean {
	const known = errorKeys(before, ctx)
	return [...errorKeys(next, ctx)].some(key => !known.has(key))
}

async function prepare(ctx: FlowExecContext, command: FlowCommand, built: FlowChange[]): Promise<FlowChange[] | FlowRejectEvent> {
	const data = ctx.state.data.value
	const prepared = command.before ? await command.before(ctx.hooks, built, data) : built
	if (prepared === null) return hookReject(command, hookNameOf(command))
	const context = { changes: prepared, source: command.source, command: command.name, data }
	const outcome = await ctx.hooks.run('beforeChange', context, prepared)
	return outcome.isCancelled ? hookReject(command, 'beforeChange') : outcome.value
}

function toDraft(ctx: FlowExecContext, command: FlowCommand, changes: FlowChange[]): FlowCommandResult {
	const previous = ctx.draft.value
	ctx.draft.value = {
		id: previous?.id ?? `draft-${Date.now()}`,
		author: ctx.props.currentUser ?? { name: '' },
		date: previous?.date ?? Date.now(),
		label: previous ? (previous.label ?? command.label) : command.label,
		changes: [...(previous?.changes ?? []), ...changes],
		status: 'open',
	}
	return { isApplied: false, changes }
}

function apply(ctx: FlowExecContext, command: FlowCommand, changes: FlowChange[]): FlowCommandResult | FlowRejectEvent {
	const before = ctx.state.data.value
	const next = applyFlowChanges(before, changes)
	if (isStructural(changes) && introducesErrors(ctx, before, next)) {
		return limitReject(command, UI_FLOW_MAP.REJECT_LIMIT_ISSUES, 'issues')
	}
	ctx.state.commit(next)
	ctx.history.push({ label: command.label, redo: changes, undo: invertFlowChanges(changes), mergeKey: command.mergeKey })
	ctx.events.emit('update:data', next)
	ctx.events.emit('change', { changes, source: command.source, command: command.name, data: next })
	if (command.name === 'move') emitMove(ctx, command, changes)
	return { isApplied: true, changes }
}

function emitMove(ctx: FlowExecContext, command: FlowCommand, changes: FlowChange[]): void {
	const positions: Record<string, { x: number; y: number }> = {}
	for (const change of changes) {
		if (change.type === 'update' && change.patch.position) positions[change.id] = change.patch.position as { x: number; y: number }
	}
	ctx.events.emit('node-move', { ids: Object.keys(positions), positions, source: command.source })
}

async function run(ctx: FlowExecContext, command: FlowCommand): Promise<FlowCommandResult> {
	const data = ctx.state.data.value
	if (ctx.props.isDisabled) return refuse(ctx.events, limitReject(command, UI_FLOW_MAP.REJECT_DISABLED, 'disabled'))
	const built = command.build(data, ctx.state.graph.value)
	if (!Array.isArray(built)) return refuse(ctx.events, built)
	if (built.length === 0) return { isApplied: false, changes: [] }
	const prepared = await prepare(ctx, command, built)
	if (!Array.isArray(prepared)) return refuse(ctx.events, prepared)
	if (ctx.state.data.value !== data) return refuse(ctx.events, limitReject(command, UI_FLOW_MAP.REJECT_STALE, 'stale'))
	if (ctx.state.mode.value === 'review' && command.source !== 'review') return toDraft(ctx, command, prepared)
	const applied = apply(ctx, command, prepared)
	return 'isApplied' in applied ? applied : refuse(ctx.events, applied)
}

async function guarded(ctx: FlowExecContext, command: FlowCommand): Promise<FlowCommandResult> {
	try {
		return await run(ctx, command)
	} catch (error) {
		const hook = hookNameOf(command)
		warn(UI_FLOW_MAP.WARN_HOOK_FAILED, { hook, message: error instanceof Error ? error.message : String(error) })
		ctx.events.emit('error', { code: 'hook-failed', message: hookFailedMessage(hook) })
		return refuse(ctx.events, hookReject(command, hook))
	}
}

export function createExecutor(ctx: FlowExecContext): FlowModel['execute'] {
	let tail: Promise<unknown> = Promise.resolve()
	return command => {
		const result = tail.then(() => guarded(ctx, command))
		tail = result.catch(() => undefined)
		return result
	}
}
