import { chainOf, depthOf } from './tree/groupTree'
import { levelForDepth, levelZoom } from './tree/semanticLevels'
import type { FlowGroupActions, FlowGroupCore } from '../../types/internal/flowGroups.types'

const SETTLE_MS = 700
const RELEASE_RATIO = 0.08

function setPin(core: FlowGroupCore, level: number, zoom: number | null = null): void {
	core.isTouched.value = true
	core.pin.value = { level, zoom, at: performance.now() }
	core.overrides.value = new Map()
}

function setZoom(core: FlowGroupCore, next: number): void {
	const current = core.pin.value
	if (!current) {
		core.zoom.value = next
		return
	}
	if (performance.now() - current.at < SETTLE_MS || current.zoom === null) {
		core.pin.value = { ...current, zoom: next }
		return
	}
	if (Math.abs(Math.log(next / current.zoom)) > RELEASE_RATIO) core.pin.value = null
	core.zoom.value = next
}

function toggle(core: FlowGroupCore, id: string, isCollapsed?: boolean): void {
	if (!core.byId.value.has(id)) return
	const next = isCollapsed ?? !core.collapsed.value.has(id)
	if (next === core.collapsed.value.has(id)) return
	core.overrides.value = new Map(core.overrides.value).set(id, next)
}

function hiddenAround(core: FlowGroupCore, ids: readonly string[]): Set<string> {
	const nodes = new Map(core.source.data().nodes.map(node => [node.id, node]))
	const hidden = new Set<string>()
	for (const id of ids) {
		const node = nodes.get(id)
		const chain = node ? chainOf(node.group, core.byId.value) : chainOf(core.byId.value.get(id)?.parent, core.byId.value)
		for (const group of chain) if (core.collapsed.value.has(group.id)) hidden.add(group.id)
	}
	return hidden
}

function reveal(core: FlowGroupCore, ids: readonly string[]): void {
	const hidden = hiddenAround(core, ids)
	if (hidden.size === 0) return
	const next = new Map(core.overrides.value)
	for (const id of hidden) next.set(id, false)
	core.overrides.value = next
}

function setLevel(core: FlowGroupCore, target: number, limits: { min: number; max: number }): number {
	const last = core.entries.value.length
	const clamped = Math.min(Math.max(Math.round(target), 0), last)
	if (last > 0) setPin(core, clamped, core.zoom.value)
	core.trail.value = core.path.value
	return last > 0 ? levelZoom(core.entries.value, clamped, limits) : core.zoom.value
}

function enter(core: FlowGroupCore, id: string): void {
	if (!core.byId.value.has(id)) return
	if (core.entries.value.length > 0) setPin(core, levelForDepth(core.entries.value, depthOf(id, core.byId.value)))
	const chain = chainOf(id, core.byId.value)
	const next = new Map(core.overrides.value)
	for (const group of chain) next.set(group.id, false)
	core.overrides.value = next
	core.trail.value = chain.map(group => group.id)
}

function leave(core: FlowGroupCore, depth?: number): string | null {
	const current = core.path.value
	const length = Math.min(Math.max(depth ?? current.length - 1, 0), current.length)
	const target = current.slice(0, length)
	const focus = target[target.length - 1] ?? null
	if (core.entries.value.length > 0) setPin(core, focus ? levelForDepth(core.entries.value, depthOf(focus, core.byId.value)) : 0)
	core.trail.value = target
	return focus
}

export function createGroupActions(core: FlowGroupCore): FlowGroupActions {
	return {
		setZoom: next => setZoom(core, next),
		toggle: (id, isCollapsed) => toggle(core, id, isCollapsed),
		reveal: ids => reveal(core, ids),
		setLevel: (target, limits) => setLevel(core, target, limits),
		enter: id => enter(core, id),
		leave: depth => leave(core, depth),
	}
}
