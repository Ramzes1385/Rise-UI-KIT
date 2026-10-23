import { flagsOfSnapshot } from '../../scene/buildLayers'
import { disposeObject } from '@/scene3d/scene/disposeObject'
import { buildLayout } from '../../scene/build/layout/buildLayout'
import { easeInOut, freeCulling, mixSlots, sameTopology, slotsOf, sourcesOf } from './layerBlend'
import type { FlowMap3DContent, FlowMap3DNodeItem } from '../../../types/internal/flowMap3dInternal.types'
import type { FlowMap3DBlend, FlowMap3DBlendOptions, FlowMap3DBlendStart } from '../../../types/internal/flowMap3dMotion.types'

const ANCHOR_LIFT = 0.1

function lerp(from: number, to: number, ratio: number): number {
	return from + (to - from) * ratio
}

function setHidden(content: FlowMap3DContent, isHidden: boolean): void {
	content.particles.setSuspended(isHidden)
	content.scenario.setSuspended(isHidden)
	if (content.labels.mesh) content.labels.mesh.visible = !isHidden
	content.layout.edges.group.children.forEach(child => {
		if (child.userData.noBlend) child.visible = !isHidden
	})
}

function nodeMover(parts: FlowMap3DBlendStart) {
	const { content, to } = parts
	const before = new Map<string, FlowMap3DNodeItem>(parts.from.nodes.map(item => [item.id, item]))
	return (ratio: number): void => {
		to.nodes.forEach(item => {
			const entry = content.nodes.entries.get(item.id)!
			const start = before.get(item.id)!
			const [x, y, z] = [lerp(start.x, item.x, ratio), lerp(start.elevation, item.elevation, ratio), lerp(start.z, item.z, ratio)]
			const top = lerp(start.elevation + start.height, item.elevation + item.height, ratio)
			entry.root.position.set(x, y, z)
			entry.position.set(x, y, z)
			entry.anchor.set(x, top + ANCHOR_LIFT, z)
		})
		content.nodes.registry.sync()
	}
}

function flagMover(parts: FlowMap3DBlendStart) {
	const start = new Map(flagsOfSnapshot(parts.from).map(flag => [flag.id, flag.anchor]))
	const ends = parts.content.layout.layers.flags.map(flag => ({ flag, end: flag.anchor.clone() }))
	return (ratio: number): void =>
		ends.forEach(({ flag, end }) => {
			const origin = start.get(flag.id)!
			flag.anchor.set(lerp(origin.x, end.x, ratio), lerp(origin.y, end.y, ratio), lerp(origin.z, end.z, ratio))
		})
}

function sourcesBefore(parts: FlowMap3DBlendStart): Float32Array[] {
	const source = buildLayout(parts.from, parts.palette, { hasSlabs: parts.hasSlabs, hasBlobs: parts.content.layout.blobs !== null })
	const sources = sourcesOf(source.roots)
	source.roots.forEach(disposeObject)
	source.arrows.dispose()
	return sources
}

function isBlendable(parts: FlowMap3DBlendStart, duration: number): boolean {
	const { from, to } = parts
	return duration > 0 && from.isLayered !== to.isLayered && sameTopology(from, to)
}

export function createLayersBlend(options: FlowMap3DBlendOptions): FlowMap3DBlend {
	let stopTick: (() => void) | null = null

	function stop(): void {
		stopTick?.()
		stopTick = null
	}

	function start(parts: FlowMap3DBlendStart): boolean {
		stop()
		const { content, to } = parts
		const duration = options.getDuration()
		if (!isBlendable(parts, duration)) return false
		const sources = sourcesBefore(parts)
		const { roots } = content.layout
		const slots = slotsOf(roots)
		const [moveNodes, moveFlags] = [nodeMover(parts), flagMover(parts)]
		freeCulling(roots)
		setHidden(content, true)
		let elapsed = 0

		function apply(ratio: number): void {
			mixSlots(slots, sources, ratio)
			moveNodes(ratio)
			moveFlags(ratio)
			content.layout.layers.setBlend(to.isLayered ? ratio : 1 - ratio)
			options.onMoved()
			options.invalidate()
		}

		apply(0)
		stopTick = options.animate(delta => {
			elapsed += delta * 1000
			apply(easeInOut(elapsed / duration))
			if (elapsed < duration) return true
			stopTick = null
			setHidden(content, false)
			options.invalidate()
			return false
		})
		return true
	}

	return { start, stop }
}
