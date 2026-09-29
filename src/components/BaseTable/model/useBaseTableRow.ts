import { computed } from 'vue'
import type { BaseTableRowProps } from '../types/body/BaseTableRow.types'

const HIDDEN_CHECKBOX_LABEL = { label: 'base-table__visually-hidden' }
const EXPAND_BUTTON_PADDING = { x: 3, y: 3 }

export function useBaseTableRow(props: BaseTableRowProps) {
	return {
		hiddenCheckboxLabel: HIDDEN_CHECKBOX_LABEL,
		expandButtonPadding: EXPAND_BUTTON_PADDING,
		isExpandable: computed(() => Boolean(props.row.isExpandable || props.row.children?.length)),
	}
}
