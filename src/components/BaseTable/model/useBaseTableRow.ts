/** Composable: логика BaseTableRow — раскрываемость строки и оформление её чекбокса и кнопки раскрытия */
import { computed } from 'vue'
import type { BaseTableRowProps } from '../types/BaseTableRow.types'

/** Подпись чекбокса строки скрыта визуально: она нужна только как доступное имя «Выбрать строку N» */
const HIDDEN_CHECKBOX_LABEL = { label: 'base-table__visually-hidden' }
/** Квадратная кнопка 24×24: иконка 16px и отступ 3px (плюс рамка 1px) */
const EXPAND_BUTTON_PADDING = { x: 3, y: 3 }

export function useBaseTableRow(props: BaseTableRowProps) {
	return {
		hiddenCheckboxLabel: HIDDEN_CHECKBOX_LABEL,
		expandButtonPadding: EXPAND_BUTTON_PADDING,
		// Строку можно раскрыть: есть дочерние строки или она помечена isExpandable (содержимое — слот expanded-content)
		isExpandable: computed(() => Boolean(props.row.isExpandable || props.row.children?.length)),
	}
}
