import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { filterEntries, sortEntries } from '../lib/fileManagerEntries'
import type { Controlled } from '../../types/FileManagerInternal.types'
import { buildIndex, folderChain, resolveFolderId } from '../lib/fileManagerIndex'
import type { BaseFileManagerEmits, FileManagerProps, FileManagerSort, FileManagerView } from '../../types/BaseFileManager.types'

const DEFAULT_SORT: FileManagerSort = { key: 'name', direction: 'asc' }

function useControlled<T>(read: () => T | undefined, fallback: T, commit: (value: T) => void): Controlled<T> {
	const inner = ref(fallback) as Ref<T>
	return {
		get(): T {
			const outer = read()
			return outer === undefined ? inner.value : outer
		},
		set(next: T): void {
			inner.value = next
			commit(next)
		},
	}
}

export function useFileManagerState(props: FileManagerProps, emit: BaseFileManagerEmits) {
	const index = computed(() => buildIndex(props.items))
	const path = useControlled<string | null>(
		() => props.path,
		null,
		value => emit('update:path', value),
	)
	const view = useControlled<FileManagerView>(
		() => props.view,
		'list',
		value => emit('update:view', value),
	)
	const sort = useControlled<FileManagerSort>(
		() => props.sort,
		DEFAULT_SORT,
		value => emit('update:sort', value),
	)
	const query = useControlled<string>(
		() => props.query,
		'',
		value => emit('update:query', value),
	)
	const selected = useControlled<string[]>(
		() => props.selected,
		[],
		value => emit('update:selected', value),
	)
	const folderId = computed(() => resolveFolderId(index.value, path.get()))
	const chain = computed(() => folderChain(index.value, folderId.value) ?? [])
	const siblings = computed(() => index.value.children.get(folderId.value) ?? [])
	const entries = computed(() => sortEntries(filterEntries(siblings.value, query.get()), sort.get()))

	return { index, path, view, sort, query, selected, folderId, chain, siblings, entries }
}
