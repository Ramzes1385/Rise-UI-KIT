import { ref, watch, computed } from 'vue'
import { UI_JSON_VIEWER } from '@/locales/messages'
import type { TreeNode } from '@components/BaseTree'
import { buildJsonTree, expandedUpTo } from './json/jsonTree'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { JsonNodeView, BaseJsonViewerEmits, BaseJsonViewerProps } from '../types/BaseJsonViewer.types'

function writeClipboard(text: string): Promise<boolean> {
	if (typeof navigator === 'undefined' || !navigator.clipboard) return Promise.resolve(false)
	return navigator.clipboard.writeText(text).then(
		() => true,
		() => false,
	)
}

export function useBaseJsonViewer(props: BaseJsonViewerProps, emit: BaseJsonViewerEmits) {
	const tree = computed(() => buildJsonTree(props.value))
	const expandedIds = ref<string[]>([])
	const status = ref('')
	watch(
		() => [tree.value, props.expandDepth ?? 1] as const,
		([current, level]) => {
			expandedIds.value = expandedUpTo(current.depths, level)
		},
		{ immediate: true },
	)
	return {
		...useStandardBaseComponent('base-json-viewer', props, ['root', 'toolbar', 'tree']),
		items: computed(() => tree.value.items),
		expandedIds,
		status,
		viewOf: (node: TreeNode): JsonNodeView => tree.value.views.get(node.id) as JsonNodeView,
		expandAll(): void {
			expandedIds.value = [...tree.value.depths.keys()]
		},
		collapseAll(): void {
			expandedIds.value = []
		},
		async copy(): Promise<void> {
			const text = JSON.stringify(props.value, null, 2) ?? 'null'
			const isCopied = await writeClipboard(text)
			status.value = isCopied ? UI_JSON_VIEWER.COPIED : UI_JSON_VIEWER.COPY_FAILED
			if (isCopied) emit('copy', text)
		},
	}
}
