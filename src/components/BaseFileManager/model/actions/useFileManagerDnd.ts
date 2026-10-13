import { ref } from 'vue'
import { canMoveTo, nodeIdToFolder } from '../lib/fileManagerIndex'
import type { FileManagerItem } from '../../types/BaseFileManager.types'
import type { FileManagerCore } from '../../types/FileManagerInternal.types'

const DRAG_TYPE = 'application/x-rise-file-manager'
const DROP_ATTRIBUTE = 'data-file-manager-drop'

function dropNodeId(event: DragEvent): string | null {
	const element = event.target instanceof Element ? event.target.closest(`[${DROP_ATTRIBUTE}]`) : null
	return element?.getAttribute(DROP_ATTRIBUTE) ?? null
}

function useDropTargets(core: FileManagerCore) {
	const draggingIds = ref<string[]>([])
	const dropTargetId = ref<string | null | undefined>(undefined)

	function reset(): void {
		draggingIds.value = []
		dropTargetId.value = undefined
	}

	function canDrop(target: string | null): boolean {
		return core.canOperate.value && canMoveTo(core.index.value, draggingIds.value, target)
	}

	function dragOver(target: string | null, event: DragEvent): void {
		if (!canDrop(target)) return
		event.preventDefault()
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
		dropTargetId.value = target
	}

	function drop(target: string | null, event: DragEvent): void {
		if (!canDrop(target)) return
		event.preventDefault()
		const ids = draggingIds.value
		reset()
		core.emit('move', ids, target)
	}

	function dragLeave(target: string | null): void {
		if (dropTargetId.value === target) dropTargetId.value = undefined
	}

	return { draggingIds, dropTargetId, reset, dragOver, drop, dragLeave }
}

export function useFileManagerDnd(core: FileManagerCore) {
	const { draggingIds, dropTargetId, reset, dragOver, drop, dragLeave } = useDropTargets(core)

	return {
		draggingIds,
		dropTargetId,
		dragEnd: reset,
		dragLeave,
		dragStart(item: FileManagerItem, event: DragEvent): void {
			if (!core.canOperate.value) {
				event.preventDefault()
				return
			}
			const isSelected = core.selection.selectedSet.value.has(item.id)
			draggingIds.value = isSelected ? [...core.selection.selectedIds.value] : [item.id]
			if (!isSelected) core.selection.selectOnly(item.id)
			event.dataTransfer?.setData(DRAG_TYPE, JSON.stringify(draggingIds.value))
			if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
		},
		entryDragOver(item: FileManagerItem, event: DragEvent): void {
			if (item.type === 'folder') dragOver(item.id, event)
		},
		entryDrop(item: FileManagerItem, event: DragEvent): void {
			if (item.type === 'folder') drop(item.id, event)
		},
		isTreeDropTarget: (nodeId: string): boolean => dropTargetId.value === nodeIdToFolder(nodeId),
		treeDragOver(event: DragEvent): void {
			const nodeId = dropNodeId(event)
			if (nodeId !== null) dragOver(nodeIdToFolder(nodeId), event)
		},
		treeDrop(event: DragEvent): void {
			const nodeId = dropNodeId(event)
			if (nodeId !== null) drop(nodeIdToFolder(nodeId), event)
		},
		treeDragLeave(event: DragEvent): void {
			const nodeId = dropNodeId(event)
			if (nodeId !== null) dragLeave(nodeIdToFolder(nodeId))
		},
	}
}
