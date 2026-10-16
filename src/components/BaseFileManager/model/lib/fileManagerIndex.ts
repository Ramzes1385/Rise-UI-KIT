import { currentLocale } from '@/locales/state'
import type { TreeNode } from '@components/BaseTree'
import type { FileManagerItem } from '../../types/BaseFileManager.types'
import type { FileManagerIndex, FileManagerNameError, FileManagerNameTarget } from '../../types/FileManagerInternal.types'

export const ROOT_NODE_ID = '__rise-file-manager-root__'
const FORBIDDEN_NAME = /[\\/]/
const MAX_UNIQUE_NAME = 1000

export function buildIndex(items: readonly FileManagerItem[]): FileManagerIndex {
	const byId = new Map<string, FileManagerItem>()
	const children = new Map<string | null, FileManagerItem[]>()
	for (const item of items) if (!byId.has(item.id)) byId.set(item.id, item)
	for (const item of byId.values()) {
		const parent = item.parentId ?? null
		children.set(parent, [...(children.get(parent) ?? []), item])
	}
	return { byId, children }
}

export function folderChain(index: FileManagerIndex, id: string | null): FileManagerItem[] | null {
	const chain: FileManagerItem[] = []
	const seen = new Set<string>()
	let current = id
	while (current !== null) {
		const item = index.byId.get(current)
		if (!item || item.type !== 'folder' || seen.has(current)) return null
		seen.add(current)
		chain.unshift(item)
		current = item.parentId ?? null
	}
	return chain
}

export function resolveFolderId(index: FileManagerIndex, id: string | null): string | null {
	return folderChain(index, id) ? id : null
}

export function descendantIds(index: FileManagerIndex, id: string): Set<string> {
	const found = new Set<string>()
	const queue = [id]
	while (queue.length) {
		for (const child of index.children.get(queue.shift() as string) ?? []) {
			if (found.has(child.id)) continue
			found.add(child.id)
			queue.push(child.id)
		}
	}
	return found
}

export function parentOf(index: FileManagerIndex, id: string): string | null {
	return index.byId.get(id)?.parentId ?? null
}

export function canMoveTo(index: FileManagerIndex, ids: readonly string[], targetId: string | null): boolean {
	if (!ids.length || !ids.every(id => index.byId.has(id))) return false
	if (!folderChain(index, targetId)) return false
	if (ids.every(id => parentOf(index, id) === targetId)) return false
	return !ids.some(id => id === targetId || (targetId !== null && descendantIds(index, id).has(targetId)))
}

export function nameError(index: FileManagerIndex, target: FileManagerNameTarget, name: string): FileManagerNameError | null {
	const value = name.trim()
	if (!value) return 'empty'
	if (FORBIDDEN_NAME.test(value) || value === '.' || value === '..') return 'forbidden'
	const key = value.toLocaleLowerCase(currentLocale.value.intl)
	const isTaken = (index.children.get(target.parentId) ?? []).some(
		item => item.id !== target.exceptId && item.name.toLocaleLowerCase(currentLocale.value.intl) === key,
	)
	return isTaken ? 'exists' : null
}

export function uniqueName(index: FileManagerIndex, parentId: string | null, base: string): string {
	for (let number = 1; number < MAX_UNIQUE_NAME; number++) {
		const candidate = number === 1 ? base : `${base} (${number})`
		if (!nameError(index, { parentId }, candidate)) return candidate
	}
	return base
}

export function nodeIdToFolder(nodeId: string): string | null {
	return nodeId === ROOT_NODE_ID ? null : nodeId
}

export function folderToNodeId(folderId: string | null): string {
	return folderId ?? ROOT_NODE_ID
}

function foldersOf(index: FileManagerIndex, parentId: string | null): FileManagerItem[] {
	const collator = new Intl.Collator(currentLocale.value.intl, { numeric: true, sensitivity: 'base' })
	return (index.children.get(parentId) ?? []).filter(item => item.type === 'folder').sort((a, b) => collator.compare(a.name, b.name))
}

function folderNode(index: FileManagerIndex, folder: FileManagerItem, isBlocked: (id: string | null) => boolean): TreeNode {
	const folders = foldersOf(index, folder.id)
	return {
		id: folder.id,
		label: folder.name,
		icon: 'folder',
		isDisabled: isBlocked(folder.id) || undefined,
		children: folders.length ? folders.map(item => folderNode(index, item, isBlocked)) : undefined,
	}
}

export function folderTree(
	index: FileManagerIndex,
	rootLabel: string,
	isBlocked: (id: string | null) => boolean = () => false,
): TreeNode[] {
	const folders = foldersOf(index, null)
	return [
		{
			id: ROOT_NODE_ID,
			label: rootLabel,
			icon: 'folder',
			isDisabled: isBlocked(null) || undefined,
			children: folders.length ? folders.map(item => folderNode(index, item, isBlocked)) : undefined,
		},
	]
}
