import { computed, ref } from 'vue'
import { titleOf } from './transferSides'
import { foldSearchText } from '@utils/data/textUtils'
import { UI_LIST, UI_TRANSFER } from '@/locales/messages'
import type { ListItem, ListModelValue } from '@components/BaseList'
import type { TransferPanel, TransferPanelsState, TransferProps, TransferSide } from '../types/BaseTransfer.types'

const defaultMatch = (item: ListItem, query: string): boolean =>
	foldSearchText(`${item.title} ${item.description ?? ''}`).includes(foldSearchText(query))

function useTransferSides<T extends ListItem>(props: TransferProps<T>) {
	const byId = computed(() => new Map(props.items.map(item => [item.id, item])))
	const targetIds = computed(() => new Set(props.modelValue))
	const sideItems = computed<Record<TransferSide, T[]>>(() => ({
		source: props.items.filter(item => !targetIds.value.has(item.id)),
		target: props.modelValue.flatMap(id => byId.value.get(id) ?? []),
	}))
	return { sideItems }
}

function useTransferQueries<T extends ListItem>(props: TransferProps<T>) {
	const queries = ref<Record<TransferSide, string>>({ source: '', target: '' })
	const activeQuery = (side: TransferSide): string => (props.isSearchable ? queries.value[side].trim() : '')
	const matches = (item: T, side: TransferSide): boolean => {
		const query = activeQuery(side)
		if (!query) return true
		return props.filterMethod ? props.filterMethod(item, query) : defaultMatch(item, query)
	}
	return {
		queries,
		activeQuery,
		matches,
		filterOf: (side: TransferSide) => (activeQuery(side) ? (item: T): boolean => matches(item, side) : undefined),
		setQuery(side: TransferSide, value: string): void {
			queries.value[side] = value
		},
	}
}

export function useTransferPanels<T extends ListItem>(props: TransferProps<T>): TransferPanelsState<T> {
	const { sideItems } = useTransferSides(props)
	const search = useTransferQueries(props)
	const checked = ref<Record<TransferSide, string[]>>({ source: [], target: [] })
	const shown = (side: TransferSide): T[] => sideItems.value[side].filter(item => search.matches(item, side))
	const checkable = (side: TransferSide): T[] => shown(side).filter(item => !item.isDisabled)
	const checkedOn = (side: TransferSide): string[] => {
		const ids = new Set(sideItems.value[side].map(item => item.id))
		return checked.value[side].filter(id => ids.has(id))
	}
	const checkedShown = (side: TransferSide): T[] => checkable(side).filter(item => checked.value[side].includes(item.id))
	return { sideItems, search, checked, shown, checkable, checkedOn, checkedShown }
}

function panelEmptyText<T extends ListItem>(props: TransferProps<T>, state: TransferPanelsState<T>, side: TransferSide): string {
	if (state.search.activeQuery(side) && state.sideItems.value[side].length) return UI_TRANSFER.NOT_FOUND
	return props.emptyText ?? UI_LIST.EMPTY
}

function panelOf<T extends ListItem>(props: TransferProps<T>, state: TransferPanelsState<T>, side: TransferSide): TransferPanel<T> {
	const checkable = state.checkable(side).length
	const checkedCount = state.checkedShown(side).length
	return {
		side,
		title: titleOf(props, side),
		items: state.sideItems.value[side],
		checked: state.checkedOn(side),
		query: state.search.queries.value[side],
		shownCount: state.shown(side).length,
		checkedShownCount: checkedCount,
		isAllChecked: checkable > 0 && checkedCount === checkable,
		isSomeChecked: checkedCount > 0 && checkedCount < checkable,
		emptyText: panelEmptyText(props, state, side),
		hint: side === 'source' ? UI_TRANSFER.HINT_TO_TARGET : UI_TRANSFER.HINT_TO_SOURCE,
	}
}

export function useTransferChecks<T extends ListItem>(props: TransferProps<T>, state: TransferPanelsState<T>) {
	return {
		panels: computed(() => [panelOf(props, state, 'source'), panelOf(props, state, 'target')]),
		setChecked(side: TransferSide, value: ListModelValue): void {
			state.checked.value[side] = Array.isArray(value) ? value : []
		},
		toggleAll(side: TransferSide): void {
			const ids = state.checkable(side).map(item => item.id)
			const isAll = ids.every(id => state.checked.value[side].includes(id))
			const rest = state.checked.value[side].filter(id => !ids.includes(id))
			state.checked.value[side] = isAll ? rest : [...rest, ...ids]
		},
	}
}
