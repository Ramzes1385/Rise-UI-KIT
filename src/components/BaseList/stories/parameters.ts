import type { ListStoryArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Список строк: значок или аватар, текст, описание, короткая подпись справа и кнопки действий. Подходит для',
				'меню разделов, списков людей и задач, выбора из короткого набора и ручной сортировки; для таблиц —',
				'BaseTable, для дерева — BaseTree, для выпадающего выбора — BaseSelect.',
				'',
				'- Режим `selection-mode`: `none` — обычный список (`role="list"`), клик и Enter — событие `activate`;',
				'  `single` и `multiple` — listbox по APG (`role="listbox"`, `aria-selected`), `v-model` — id или массив id.',
				'- Клавиатура: в списке одна точка Tab; ↑/↓, Home, End и поиск по первым буквам. Пробел и Enter выбирают;',
				'  в `multiple` Shift+клик, Shift+пробел и Shift+↑/↓ выбирают диапазон, Ctrl/⌘+A — все доступные строки.',
				'- `is-sortable` и `v-model:items`: строку можно перетащить мышью за любое место (после сдвига на 5 px,',
				'  Escape отменяет) или переставить с клавиатуры — альтернатива перетаскиванию по WCAG 2.5.7. В режиме `none`',
				'  пробел берёт строку, стрелки двигают, пробел или Enter кладут, Escape отменяет; в любом режиме Alt + ↑/↓',
				'  сразу сдвигает строку. Каждый шаг объявляется через `role="status"`, подсказка клавиш — в описании строки.',
				'- `can-move` запрещает место: строка остаётся, скринридер слышит отказ. `filter` показывает часть строк,',
				'  скрытые при перестановке сохраняют свои места. `move` — откуда и куда (индексы в полном `items`).',
				'- `is-virtual` и `height`: в DOM только видимые строки — для тысяч строк; строка с фокусом не выгружается.',
				'- Методы через `ref`: `focusItem`, `selectAll`, `clearSelection`, `moveItem(id, index)` — для своих кнопок',
				'  «Выше / Ниже» (касанием строки не перетаскиваются).',
				'- Перестановка построена на composable `useSortable` — тот же, что у BaseKanban (страница Composables/useSortable).',
				'- Размеры при `sizeScale` = 100: строка не ниже 40 px, отступы 8 × 10 px; размер меняется через `size-scale`.',
			].join('\n'),
		},
	},
} satisfies Meta<ListStoryArgs>['parameters']
