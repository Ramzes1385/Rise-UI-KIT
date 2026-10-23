import { ref, watch } from 'vue'
import { createGroupCore } from './groupCore'
import { createGroupActions } from './groupActions'
import type { FlowGroupCore, FlowGroupSource, FlowGroupState } from '../../types/internal/flowGroups.types'

const MORPH_MS = 360

function isSameSet(first: ReadonlySet<string>, second: ReadonlySet<string>): boolean {
	return first.size === second.size && [...first].every(id => second.has(id))
}

function watchCore(core: FlowGroupCore, pulse: () => void): void {
	watch(core.index, () => (core.overrides.value = new Map()), { flush: 'sync' })
	watch(
		() => core.entries.value.length,
		count => {
			if (count > 0 && !core.isTouched.value) core.pin.value = { level: 0, zoom: null, at: performance.now() }
		},
		{ flush: 'sync', immediate: true },
	)
	watch(core.collapsed, (next, previous) => !isSameSet(next, previous) && pulse(), { flush: 'sync' })
}

export function useFlowGroupState(source: FlowGroupSource): FlowGroupState {
	const core = createGroupCore(source)
	const isMorphing = ref(false)
	let morphTimer: ReturnType<typeof setTimeout> | undefined
	function pulse(): void {
		isMorphing.value = true
		clearTimeout(morphTimer)
		morphTimer = setTimeout(() => (isMorphing.value = false), MORPH_MS)
	}
	watchCore(core, pulse)
	const { collapsed, entries, level } = core
	return { collapsed, entries, level, isMorphing, ...createGroupActions(core) }
}
