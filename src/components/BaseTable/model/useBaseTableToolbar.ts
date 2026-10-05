import { computed } from 'vue'
import { useTableUi } from './useTableUi'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import type { BaseTableToolbarEmits, BaseTableToolbarProps } from '../types/toolbar/BaseTableToolbar.types'

const HIDDEN_LABEL = { label: 'base-table__visually-hidden' }

export function useBaseTableToolbar(props: BaseTableToolbarProps, emit: BaseTableToolbarEmits) {
	const columnItems = computed<DropdownMenuItem[]>(() =>
		props.columns.map(column => ({
			type: 'checkbox',
			label: column.label,
			isChecked: !column.isHidden,
			onUpdateChecked: () => emit('toggle-column-visibility', column),
		})),
	)

	return { ui: useTableUi(), hiddenLabel: HIDDEN_LABEL, columnItems }
}
