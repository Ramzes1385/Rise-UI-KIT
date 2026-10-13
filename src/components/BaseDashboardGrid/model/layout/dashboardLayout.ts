import { warn } from '@/locales/warn'
import { UI_WARNINGS } from '@/locales/messages'
import type { DashboardCompactType, DashboardLayout, DashboardLayoutItem, DashboardLayoutRules } from '../../types/BaseDashboardGrid.types'

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), Math.max(min, max))

const whole = (value: number, fallback: number): number => (Number.isFinite(value) ? Math.round(value) : fallback)

export function collides(a: DashboardLayoutItem, b: DashboardLayoutItem): boolean {
	return a.id !== b.id && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function collisionsOf(layout: DashboardLayout, item: DashboardLayoutItem): DashboardLayout {
	return layout.filter(other => collides(item, other))
}

export function layoutBottom(layout: DashboardLayout): number {
	return layout.reduce((bottom, item) => Math.max(bottom, item.y + item.h), 0)
}

export function sortLayout(layout: DashboardLayout): DashboardLayout {
	return [...layout].sort((a, b) => a.y - b.y || a.x - b.x)
}

const sameCell = (a: DashboardLayoutItem, b: DashboardLayoutItem): boolean =>
	a.id === b.id && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h

export function layoutsEqual(a: DashboardLayout, b: DashboardLayout): boolean {
	return a.length === b.length && a.every((item, index) => sameCell(item, b[index]))
}

export function clampItem(item: DashboardLayoutItem, cols: number): DashboardLayoutItem {
	const minW = clamp(whole(item.minW ?? 1, 1), 1, cols)
	const maxW = clamp(whole(item.maxW ?? cols, cols), minW, cols)
	const minH = Math.max(whole(item.minH ?? 1, 1), 1)
	const maxH = Math.max(whole(item.maxH ?? Infinity, Infinity), minH)
	const w = clamp(whole(item.w, minW), minW, maxW)
	const h = clamp(whole(item.h, minH), minH, maxH)
	return { ...item, w, h, x: clamp(whole(item.x, 0), 0, cols - w), y: Math.max(whole(item.y, 0), 0) }
}

function dropToFree(placed: DashboardLayout, item: DashboardLayoutItem): DashboardLayoutItem {
	let next = item
	let hit = collisionsOf(placed, next)[0]
	while (hit) {
		next = { ...next, y: hit.y + hit.h }
		hit = collisionsOf(placed, next)[0]
	}
	return next
}

function floatUp(placed: DashboardLayout, item: DashboardLayoutItem): DashboardLayoutItem {
	let next = { ...item, y: Math.min(layoutBottom(placed), item.y) }
	while (next.y > 0 && collisionsOf(placed, { ...next, y: next.y - 1 }).length === 0) next = { ...next, y: next.y - 1 }
	return dropToFree(placed, next)
}

export function placeAll(layout: DashboardLayout, compactType: DashboardCompactType): DashboardLayout {
	const placed = layout.filter(item => item.isStatic)
	const moved = new Map<string, DashboardLayoutItem>()
	for (const item of sortLayout(layout.filter(other => !other.isStatic))) {
		const next = compactType === 'vertical' ? floatUp(placed, item) : dropToFree(placed, item)
		placed.push(next)
		moved.set(item.id, next)
	}
	return layout.map(item => moved.get(item.id) ?? item)
}

function hopsUp(items: Map<string, DashboardLayoutItem>, mover: DashboardLayoutItem, other: DashboardLayoutItem): boolean {
	const hop = { ...other, y: Math.max(other.y - mover.h, 0) }
	if (collisionsOf([...items.values()], hop).length > 0) return false
	other.y = hop.y
	return true
}

export function resolveCollisions(layout: DashboardLayout, moverId: string, preferUp: boolean): DashboardLayout {
	const items = new Map(layout.map(item => [item.id, { ...item }]))
	const queue = [moverId]
	let isFirst = preferUp
	while (queue.length > 0) {
		const current = items.get(queue.shift() as string) as DashboardLayoutItem
		for (const other of sortLayout(collisionsOf([...items.values()], current))) {
			if (other.isStatic) {
				current.y = other.y + other.h
				queue.push(current.id)
				break
			}
			if (isFirst && hopsUp(items, current, other)) continue
			other.y = current.y + current.h
			queue.push(other.id)
		}
		isFirst = false
	}
	return layout.map(item => items.get(item.id) as DashboardLayoutItem)
}

function uniqueItems(layout: DashboardLayout): DashboardLayout {
	const seen = new Set<string>()
	return layout.filter(item => {
		if (!seen.has(item.id)) {
			seen.add(item.id)
			return true
		}
		warn(UI_WARNINGS.DASHBOARD_GRID_DUPLICATE_ID, { id: item.id })
		return false
	})
}

export function normalizeLayout(layout: DashboardLayout, rules: DashboardLayoutRules): DashboardLayout {
	return placeAll(
		uniqueItems(layout).map(item => clampItem(item, rules.cols)),
		rules.compactType,
	)
}

export function moveItem(
	layout: DashboardLayout,
	target: { id: string; x: number; y: number },
	rules: DashboardLayoutRules,
): DashboardLayout {
	const { id } = target
	const item = layout.find(other => other.id === id)
	if (!item || item.isStatic) return layout
	const moved = clampItem({ ...item, x: target.x, y: target.y }, rules.cols)
	const next = layout.map(other => (other.id === id ? moved : other))
	return placeAll(resolveCollisions(next, id, moved.y > item.y), rules.compactType)
}

export function resizeItem(
	layout: DashboardLayout,
	size: { id: string; w: number; h: number },
	rules: DashboardLayoutRules,
): DashboardLayout {
	const { id } = size
	const item = layout.find(other => other.id === id)
	if (!item || item.isStatic) return layout
	const resized = clampItem({ ...item, w: Math.min(size.w, rules.cols - item.x), h: size.h }, rules.cols)
	const next = layout.map(other => (other.id === id ? resized : other))
	return placeAll(resolveCollisions(next, id, false), rules.compactType)
}
