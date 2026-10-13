import { computed } from 'vue'
import { UI_FILE_MANAGER } from '@/locales/messages'
import type { SegmentedOption } from '@components/BaseSegmented'
import type { BreadcrumbItem } from '@components/BaseBreadcrumbs'
import { formatMessage, getLocale, pluralize } from '@/locales/state'
import type { FileManagerCore, FileManagerSortButton } from '../../types/FileManagerInternal.types'
import { FILE_MANAGER_SORT_KEYS, type FileManagerSortKey, type FileManagerView } from '../../types/BaseFileManager.types'

const SORT_ICONS = { asc: 'sort-up', desc: 'sort-down' } as const
const SORT_LABELS = { name: 'SORT_NAME', size: 'SORT_SIZE', modifiedAt: 'SORT_MODIFIED' } as const

function useToolbarSort(core: FileManagerCore) {
	return {
		sortButtons: computed((): FileManagerSortButton[] =>
			FILE_MANAGER_SORT_KEYS.map(key => {
				const { key: activeKey, direction } = core.sort.get()
				const isActive = key === activeKey
				const label = UI_FILE_MANAGER[SORT_LABELS[key]]
				const state = direction === 'asc' ? UI_FILE_MANAGER.SORT_ASC : UI_FILE_MANAGER.SORT_DESC
				return {
					key,
					label,
					isActive,
					icon: isActive ? SORT_ICONS[direction] : undefined,
					ariaLabel: formatMessage(UI_FILE_MANAGER.SORT_BY, { name: isActive ? `${label}, ${state}` : label }),
				}
			}),
		),
		toggleSort(key: FileManagerSortKey): void {
			const { key: activeKey, direction } = core.sort.get()
			if (key === activeKey) core.sort.set({ key, direction: direction === 'asc' ? 'desc' : 'asc' })
			else core.sort.set({ key, direction: key === 'name' ? 'asc' : 'desc' })
		},
	}
}

function useToolbarTexts(core: FileManagerCore) {
	return {
		statusText: computed((): string => {
			const plural = getLocale().plural
			const total = pluralize(plural.FILE_MANAGER_ITEMS, core.entries.value.length)
			const count = core.selection.selectedIds.value.length
			return count ? `${total} · ${pluralize(plural.FILE_MANAGER_SELECTED, count)}` : total
		}),
		listLabel: computed((): string => {
			const current = core.chain.value[core.chain.value.length - 1]
			return formatMessage(UI_FILE_MANAGER.LIST_LABEL, { name: current?.name ?? core.rootName.value })
		}),
		isSearch: computed(() => core.query.get().trim() !== ''),
		emptyText: computed((): string => {
			const query = core.query.get().trim()
			if (query) return formatMessage(UI_FILE_MANAGER.SEARCH_EMPTY_TEXT, { query })
			return core.canOperate.value ? UI_FILE_MANAGER.EMPTY_TEXT : ''
		}),
	}
}

export function useFileManagerToolbar(core: FileManagerCore, navigateToCrumb: (position: number) => void) {
	const breadcrumbs = computed((): BreadcrumbItem[] => [
		{ label: core.rootName.value, icon: 'home' },
		...core.chain.value.map(folder => ({ label: folder.name })),
	])

	return {
		...useToolbarSort(core),
		...useToolbarTexts(core),
		breadcrumbs,
		queryValue: computed(() => core.query.get()),
		viewValue: computed(() => core.view.get()),
		canGoUp: computed(() => core.canNavigate.value && core.folderId.value !== null),
		hasSelection: computed(() => core.selection.selectedIds.value.length > 0),
		isSingleSelected: computed(() => core.selection.selectedIds.value.length === 1),
		viewOptions: computed((): SegmentedOption[] => [
			{ value: 'list', label: UI_FILE_MANAGER.VIEW_LIST },
			{ value: 'grid', label: UI_FILE_MANAGER.VIEW_GRID },
		]),
		retry(): void {
			core.emit('retry')
		},
		setQuery(value: string): void {
			core.query.set(value)
		},
		selectCrumb(item: BreadcrumbItem): void {
			navigateToCrumb(breadcrumbs.value.indexOf(item))
		},
		setView(value: string | number): void {
			core.view.set(value as FileManagerView)
		},
	}
}
