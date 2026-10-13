import { warn } from '@/locales/warn'
import { UI_GANTT } from '@/locales/messages'
import { parseGanttDate } from '../calendar/ganttCalendar'
import type { GanttItem } from '../../types/BaseGanttModel.types'
import type { GanttTask, GanttTaskId } from '../../types/BaseGantt.types'

function clampProgress(value: number | undefined): number {
	if (value === undefined || Number.isNaN(value)) return 0
	return Math.min(100, Math.max(0, value))
}

function toItem(task: GanttTask, seen: Set<GanttTaskId>): GanttItem | null {
	if (seen.has(task.id)) {
		warn(UI_GANTT.WARN_DUPLICATE_ID, { id: task.id })
		return null
	}
	const start = parseGanttDate(task.start)
	const rawEnd = task.isMilestone || task.end === undefined ? start : parseGanttDate(task.end)
	if (!start || !rawEnd) {
		warn(UI_GANTT.WARN_BAD_DATE, { id: task.id })
		return null
	}
	if (rawEnd < start) warn(UI_GANTT.WARN_BAD_RANGE, { id: task.id })
	seen.add(task.id)
	return {
		id: task.id,
		task,
		name: task.name,
		start,
		end: rawEnd < start ? start : rawEnd,
		progress: clampProgress(task.progress),
		parentId: null,
		dependencies: [],
		isMilestone: Boolean(task.isMilestone),
		level: 0,
		hasChildren: false,
		position: 1,
		setSize: 1,
	}
}

function resolveParents(items: GanttItem[]): Map<GanttTaskId, GanttTaskId | null> {
	const known = new Set(items.map(item => item.id))
	const parents = new Map<GanttTaskId, GanttTaskId | null>()
	for (const item of items) {
		const parentId = item.task.parentId
		const isValid = parentId !== undefined && parentId !== item.id && known.has(parentId)
		if (parentId !== undefined && !isValid) warn(UI_GANTT.WARN_BAD_PARENT, { id: item.id, parentId })
		parents.set(item.id, isValid ? parentId : null)
	}
	return parents
}

function breakParentCycles(items: GanttItem[], parents: Map<GanttTaskId, GanttTaskId | null>): void {
	for (const item of items) {
		const walked = new Set<GanttTaskId>()
		let current = parents.get(item.id) ?? null
		while (current !== null && current !== item.id && !walked.has(current)) {
			walked.add(current)
			current = parents.get(current) ?? null
		}
		if (current !== item.id) continue
		parents.set(item.id, null)
		warn(UI_GANTT.WARN_PARENT_CYCLE, { id: item.id })
	}
}

function arrange(items: GanttItem[], parents: Map<GanttTaskId, GanttTaskId | null>): GanttItem[] {
	const children = new Map<GanttTaskId | null, GanttItem[]>()
	for (const item of items) {
		const parentId = parents.get(item.id) ?? null
		item.parentId = parentId
		children.set(parentId, [...(children.get(parentId) ?? []), item])
	}
	const ordered: GanttItem[] = []
	const walk = (parentId: GanttTaskId | null, level: number): void => {
		const siblings = children.get(parentId) ?? []
		siblings.forEach((item, index) => {
			Object.assign(item, { level, position: index + 1, setSize: siblings.length, hasChildren: children.has(item.id) })
			ordered.push(item)
			walk(item.id, level + 1)
		})
	}
	walk(null, 0)
	return ordered
}

function reaches(successors: Map<GanttTaskId, GanttTaskId[]>, from: GanttTaskId, to: GanttTaskId): boolean {
	const stack = [from]
	const visited = new Set<GanttTaskId>()
	while (stack.length) {
		const current = stack.pop() as GanttTaskId
		if (current === to) return true
		if (visited.has(current)) continue
		visited.add(current)
		stack.push(...(successors.get(current) ?? []))
	}
	return false
}

function linkDependencies(items: GanttItem[]): void {
	const known = new Set(items.map(item => item.id))
	const successors = new Map<GanttTaskId, GanttTaskId[]>()
	for (const item of items) {
		for (const dependencyId of new Set(item.task.dependencies ?? [])) {
			if (!known.has(dependencyId)) {
				warn(UI_GANTT.WARN_BAD_DEPENDENCY, { id: item.id, dependencyId })
				continue
			}
			if (reaches(successors, item.id, dependencyId)) {
				warn(UI_GANTT.WARN_DEPENDENCY_CYCLE, { id: item.id, dependencyId })
				continue
			}
			item.dependencies.push(dependencyId)
			successors.set(dependencyId, [...(successors.get(dependencyId) ?? []), item.id])
		}
	}
}

export function normalizeTasks(tasks: readonly GanttTask[]): GanttItem[] {
	const seen = new Set<GanttTaskId>()
	const items = tasks.map(task => toItem(task, seen)).filter((item): item is GanttItem => item !== null)
	const parents = resolveParents(items)
	breakParentCycles(items, parents)
	const ordered = arrange(items, parents)
	linkDependencies(ordered)
	return ordered
}

export function visibleItems(items: readonly GanttItem[], collapsed: ReadonlySet<GanttTaskId>): GanttItem[] {
	const result: GanttItem[] = []
	let hiddenBelow = Infinity
	for (const item of items) {
		if (item.level > hiddenBelow) continue
		hiddenBelow = Infinity
		result.push(item)
		if (item.hasChildren && collapsed.has(item.id)) hiddenBelow = item.level
	}
	return result
}
