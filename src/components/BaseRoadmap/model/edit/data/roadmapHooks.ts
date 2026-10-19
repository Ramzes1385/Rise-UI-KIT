import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { onScopeDispose, shallowRef, watch } from 'vue'
import type { BaseRoadmapProps, RoadmapHooks } from '../../../types/BaseRoadmap.types'
import { createHookRunner } from '@composables/editor/useCommandHistory/helpers/hookRunner'
import type { HookRunner } from '@composables/editor/useCommandHistory/types/useCommandHistory.types'
import type {
	RoadmapHookBoard,
	RoadmapHookName,
	RoadmapHookResult,
	RoadmapPropSubscription,
} from '../../../types/internal/roadmapEdit.internal.types'

const ROADMAP_HOOK_NAMES = ['beforeStatusChange', 'beforeChange', 'beforeDelete'] as const

function isThenable(value: unknown): value is PromiseLike<unknown> {
	return typeof (value as PromiseLike<unknown> | null)?.then === 'function'
}

function refusalReason(name: string, context: unknown): string {
	const value = (context ?? {}) as Record<string, unknown>
	if (name === 'beforeChange') return formatMessage(UI_ROADMAP_EDIT.HOOK_REASON_CHANGE, { command: String(value.command ?? '') })
	if (name === 'beforeDelete') return UI_ROADMAP_EDIT.HOOK_REASON_DELETE
	return formatMessage(UI_ROADMAP_EDIT.HOOK_REASON_STATUS, {
		title: String((value.topic as { title?: string } | undefined)?.title ?? ''),
	})
}

function subscribe(props: BaseRoadmapProps, hooks: HookRunner<RoadmapHooks>, name: RoadmapHookName): RoadmapPropSubscription {
	const fn = props[name]
	const call = (context: never): unknown => (props[name] as ((value: never) => unknown) | undefined)?.(context)
	Object.defineProperty(call, 'name', { value: (fn as { name: string }).name })
	return { fn, off: (hooks.on as (name: string, handler: unknown) => () => void)(name, call) }
}
function createBoard(): RoadmapHookBoard {
	const base = createHookRunner<RoadmapHooks>()
	const revision = shallowRef(0)
	const results = new Map<string, RoadmapHookResult>()
	const bump = (): void => {
		revision.value += 1
	}
	const note = (id: string, result: RoadmapHookResult): void => {
		results.set(id, result)
		bump()
	}
	return {
		...base,
		revision,
		resultOf: id => results.get(id),
		on(name, handler, options) {
			const known = new Set(base.list().map(item => item.id))
			let id = ''
			const wrapped = (context: never): unknown => {
				const report = (answer: unknown): unknown => {
					note(
						id,
						answer === false ? { isCancelled: true, reason: refusalReason(name as string, context) } : { isCancelled: false },
					)
					return answer
				}
				try {
					const answer = (handler as (value: never) => unknown)(context)
					return isThenable(answer) ? Promise.resolve(answer).then(report) : report(answer)
				} catch (error) {
					note(id, { isCancelled: true, reason: UI_ROADMAP_EDIT.HOOK_REASON_ERROR })
					throw error
				}
			}
			Object.defineProperty(wrapped, 'name', { value: (handler as { name: string }).name })
			const off = base.on(name, wrapped as unknown as typeof handler, options)
			id = base.list().find(item => !known.has(item.id))!.id
			bump()
			return () => {
				off()
				results.delete(id)
				bump()
			}
		},
		setEnabled(id, isEnabled) {
			base.setEnabled(id, isEnabled)
			bump()
		},
	}
}

export function createRoadmapHooks(props: BaseRoadmapProps): RoadmapHookBoard {
	const hooks = createBoard()
	const subs = new Map<RoadmapHookName, RoadmapPropSubscription>()
	const sync = (): void => {
		for (const name of ROADMAP_HOOK_NAMES) {
			const current = subs.get(name)
			if (current && current.fn === props[name]) continue
			current?.off()
			subs.delete(name)
			if (typeof props[name] === 'function') subs.set(name, subscribe(props, hooks, name))
		}
	}
	watch(() => ROADMAP_HOOK_NAMES.map(name => props[name]), sync, { immediate: true, flush: 'sync' })
	onScopeDispose(() => subs.forEach(item => item.off()))
	return hooks
}
