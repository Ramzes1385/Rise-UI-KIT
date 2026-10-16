import { useTableUi } from './useTableUi'
import { computed, nextTick, ref } from 'vue'
import { isImeKeydown } from '@utils/dom/keyboardUtils'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import { useToolbarKeyboard } from '@composables/interaction/useToolbarKeyboard'
import type { BaseTableToolbarEmits, BaseTableToolbarProps } from '../types/toolbar/BaseTableToolbar.types'

const HIDDEN_LABEL = { label: 'base-table__visually-hidden' }
const FILTER_REMOVE_SELECTOR = '.base-table__filter-remove'

function toIsoDay(date: Date | null): string {
	if (!date) return ''
	const month = String(date.getMonth() + 1).padStart(2, '0')
	return `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2, '0')}`
}

function fromIsoDay(value: string): Date | null {
	if (!value) return null
	const [year, month, day] = value.split('-').map(Number)
	return new Date(year, month - 1, day)
}

export function useBaseTableToolbar(props: BaseTableToolbarProps, emit: BaseTableToolbarEmits) {
	const toolbarRef = ref<HTMLElement | null>(null)
	const keyboard = useToolbarKeyboard({ rootRef: toolbarRef })
	const columnItems = computed<DropdownMenuItem[]>(() =>
		props.columns.map(column => ({
			type: 'checkbox',
			label: column.label,
			isChecked: !column.isHidden,
			onUpdateChecked: () => emit('toggle-column-visibility', column),
		})),
	)

	async function removeFilter(index: number): Promise<void> {
		emit('remove-filter', index)
		await nextTick()
		const buttons = toolbarRef.value?.querySelectorAll<HTMLElement>(FILTER_REMOVE_SELECTOR) ?? []
		const next = buttons[Math.min(index, buttons.length - 1)]
		if (next) next.focus()
		else keyboard.focusItem(0)
	}

	return {
		ui: useTableUi(),
		hiddenLabel: HIDDEN_LABEL,
		columnItems,
		toolbarRef,
		handleKeydown: keyboard.handleKeydown,
		handleFocusin: keyboard.handleFocusin,
		removeFilter,
		handleFilterEnter(event: KeyboardEvent): void {
			if (event.key === 'Enter' && !isImeKeydown(event)) emit('add-filter')
		},
		toDate: fromIsoDay,
		setDateValue: (date: Date | null): void => emit('update:filter-value', toIsoDay(date)),
		setDateValueTo: (date: Date | null): void => emit('update:filter-value-to', toIsoDay(date)),
		setValues: (value: string | number | (string | number)[]): void => emit('update:filter-values', [value].flat().map(String)),
		setSingleValue: (value: string | number | (string | number)[]): void =>
			emit('update:filter-value', String([value].flat()[0] ?? '')),
	}
}
