import { pluralize } from '@/locales/state'
import { UI_PLURAL } from '@/locales/messages'
import type { TreeNode } from '@components/BaseTree'
import type { JsonNodeView, JsonValueType } from '../../types/BaseJsonViewer.types'

const ROOT = '$'

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/

const CONTAINERS: readonly JsonValueType[] = ['object', 'array']

export function jsonType(value: unknown): JsonValueType {
	if (Array.isArray(value)) return 'array'
	if (value !== null && typeof value === 'object') return 'object'
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return typeof value as JsonValueType
	return 'null'
}

export function childPath(parent: string, key: string | number): string {
	if (typeof key === 'number') return `${parent}[${key}]`
	if (IDENTIFIER.test(key)) return `${parent}.${key}`
	return `${parent}[${JSON.stringify(key)}]`
}

function entriesOf(value: unknown): [string | number, unknown][] {
	if (Array.isArray(value)) return value.map((item, index) => [index, item])
	return Object.entries(value as Record<string, unknown>)
}

export function jsonPreview(value: unknown, type: JsonValueType): string {
	const plural = UI_PLURAL
	if (type === 'array') {
		const size = (value as unknown[]).length
		return size ? pluralize(plural.JSON_ITEMS, size) : '[]'
	}
	if (type === 'object') {
		const size = Object.keys(value as object).length
		return size ? pluralize(plural.JSON_KEYS, size) : '{}'
	}
	if (type === 'string') return JSON.stringify(value)
	return type === 'null' ? 'null' : String(value)
}

export function buildJsonTree(value: unknown) {
	const views = new Map<string, JsonNodeView>()
	const depths = new Map<string, number>()
	const visit = (entry: { key: string; value: unknown; path: string }, depth: number): TreeNode => {
		const type = jsonType(entry.value)
		const view: JsonNodeView = { path: entry.path, key: entry.key, type, preview: jsonPreview(entry.value, type) }
		views.set(entry.path, view)
		const node: TreeNode = { id: entry.path, label: view.key ? `${view.key}: ${view.preview}` : view.preview }
		const children = CONTAINERS.includes(type) ? entriesOf(entry.value) : []
		if (children.length === 0) return node
		depths.set(entry.path, depth)
		node.children = children.map(([key, child]) =>
			visit({ key: String(key), value: child, path: childPath(entry.path, key) }, depth + 1),
		)
		return node
	}
	const root = visit({ key: '', value, path: ROOT }, -1)
	const items = root.children ?? [root]
	depths.delete(ROOT)
	return { items, views, depths }
}

export const expandedUpTo = (depths: ReadonlyMap<string, number>, level: number): string[] =>
	[...depths].filter(([, depth]) => depth < level).map(([path]) => path)
