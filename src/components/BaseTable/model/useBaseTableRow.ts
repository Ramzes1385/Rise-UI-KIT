import { computed } from 'vue'
import type { BaseTableRowProps } from '../types/body/BaseTableRow.types'

const EXPAND_BUTTON_PADDING = { x: 3, y: 3 }

export function useBaseTableRow(props: BaseTableRowProps) {
	return {
		expandButtonPadding: EXPAND_BUTTON_PADDING,
		isExpandable: computed(() => Boolean(props.row.isExpandable || props.row.children?.length)),
	}
}
