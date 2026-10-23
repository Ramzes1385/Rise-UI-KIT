import { computed, ref, watch } from 'vue'
import type { FileManagerCore } from '../../types/FileManagerInternal.types'
import { folderToNodeId, folderTree, nodeIdToFolder, ROOT_NODE_ID } from '../lib/fileManagerIndex'

export function useFileManagerTree(core: FileManagerCore, navigate: (folderId: string | null) => void) {
	const expandedIds = ref<string[]>([ROOT_NODE_ID])

	watch(
		() => core.chain.value.map(folder => folder.id),
		ids => {
			expandedIds.value = [...new Set([...expandedIds.value, ROOT_NODE_ID, ...ids])]
		},
		{ immediate: true },
	)

	return {
		expandedIds,
		treeNodes: computed(() => folderTree(core.index.value, core.rootName.value)),
		treeSelectedIds: computed(() => [folderToNodeId(core.folderId.value)]),
		selectTreeNode(ids: string[]): void {
			if (ids.length) navigate(nodeIdToFolder(ids[0]))
		},
	}
}
