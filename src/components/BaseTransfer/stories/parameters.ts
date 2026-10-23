import type { Meta } from '@storybook/vue3-vite'
import type { BaseTransferProps } from '../types/BaseTransfer.types'

export const parameters = {
	docs: {
		description: {
			component: [
				'Перенос строк между двумя списками: «Доступно» и «Выбрано». v-model — массив id в «Выбрано» в их порядке; перенесённые строки встают в конец.',
				'Подходит, когда из длинного списка нужно собрать подмножество и видеть оба набора сразу: участники, права, колонки отчёта. Для короткого списка хватит BaseCheckboxGroup, для выбора в поле — BaseSelect с `multiple`.',
				'',
				'- Панели — BaseList в режиме `multiple` (APG Listbox): ↑/↓, Home/End, Space и Enter отмечают, Shift — диапазон, Ctrl/⌘ + A — все показанные.',
				'- Перенос — кнопками между панелями или **Ctrl (или Alt) + →** в «Доступно» и **Ctrl (или Alt) + ←** в «Выбрано». После переноса клавишами фокус остаётся на том же месте списка; после кнопки — переходит на первую перенесённую строку.',
				'- «Выбрать все» и счётчик «N из M» считают только показанные доступные строки; поиск (`isSearchable`) ищет по `title` и `description`, свой — `filterMethod`. Переносятся только показанные отмеченные строки.',
				'- `isSortable` — перестановка в «Выбрано» мышью и Alt + ↑/↓ (порядок v-model). Перенос объявляется в `role="status"`, подсказка клавиш связана с панелью через `aria-describedby`.',
			].join('\n'),
		},
	},
} satisfies Meta<BaseTransferProps>['parameters']
