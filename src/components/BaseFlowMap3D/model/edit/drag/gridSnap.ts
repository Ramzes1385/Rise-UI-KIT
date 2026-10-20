import type { FlowPoint } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowMap3DEditTarget } from '../../../types/internal/flowMap3dEdit.types'
import type { FlowMap3DNodeItem, FlowMap3DSnapshot } from '../../../types/internal/flowMap3dInternal.types'

export const DEFAULT_GRID = 8

const EPSILON = 1e-6

export function gridOf(...sizes: Array<number | undefined>): number {
	const found = sizes.find(size => typeof size === 'number' && Number.isFinite(size) && size >= 0)
	return found ?? DEFAULT_GRID
}

function snapTo(value: number, grid: number): number {
	return grid > 0 ? Math.round(value / grid) * grid : value
}

export function footprintOf(item: Pick<FlowMap3DNodeItem, 'scale'>, snapshot: Pick<FlowMap3DSnapshot, 'cell'>): number {
	return snapshot.cell.width * item.scale
}

function isOverlap(first: { x: number; z: number; size: number }, second: { x: number; z: number; size: number }): boolean {
	const reach = (first.size + second.size) / 2 - EPSILON
	return Math.abs(first.x - second.x) < reach && Math.abs(first.z - second.z) < reach
}

function isCellTaken(item: FlowMap3DNodeItem, center: { x: number; z: number }, snapshot: FlowMap3DSnapshot): boolean {
	const probe = { ...center, size: footprintOf(item, snapshot) }
	return snapshot.nodes.some(
		other =>
			other.id !== item.id &&
			other.base === item.base &&
			isOverlap(probe, { x: other.x, z: other.z, size: footprintOf(other, snapshot) }),
	)
}

function targetOf(item: FlowMap3DNodeItem, position: FlowPoint, snapshot: FlowMap3DSnapshot): FlowMap3DEditTarget {
	const { unit, origin } = snapshot
	const x = (position.x + item.rect.width / 2) / unit - origin.x
	const z = (position.y + item.rect.height / 2) / unit - origin.z
	return { x, z, position, isFree: !isCellTaken(item, { x, z }, snapshot) }
}

export function targetAt(
	item: FlowMap3DNodeItem,
	point: { x: number; z: number },
	view: { snapshot: FlowMap3DSnapshot; grid: number },
): FlowMap3DEditTarget {
	const { snapshot, grid } = view
	const { unit, origin } = snapshot
	const position = {
		x: snapTo((point.x + origin.x) * unit - item.rect.width / 2, grid),
		y: snapTo((point.z + origin.z) * unit - item.rect.height / 2, grid),
	}
	return targetOf(item, position, snapshot)
}

export function targetShifted(item: FlowMap3DNodeItem, delta: FlowPoint, snapshot: FlowMap3DSnapshot): FlowMap3DEditTarget {
	return targetOf(item, { x: item.rect.x + delta.x, y: item.rect.y + delta.y }, snapshot)
}

export function arrowDirection(key: string, azimuth: number): { x: number; z: number } {
	const right = { x: Math.cos(azimuth), z: -Math.sin(azimuth) }
	const away = { x: -Math.sin(azimuth), z: -Math.cos(azimuth) }
	const sign = key === 'ArrowLeft' || key === 'ArrowDown' ? -1 : 1
	const axis = key === 'ArrowLeft' || key === 'ArrowRight' ? right : away
	return Math.abs(axis.x) >= Math.abs(axis.z) ? { x: Math.sign(axis.x) * sign, z: 0 } : { x: 0, z: Math.sign(axis.z) * sign }
}
