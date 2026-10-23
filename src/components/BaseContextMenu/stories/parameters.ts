import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseContextMenu from '../ui/BaseContextMenu.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Меню по правому клику на области: карточка, строка таблицы, холст редактора.',
				'',
				'- Открывается правым кликом у указателя, клавишей «Меню» или Shift+F10 — у элемента с фокусом.',
				'  У края окна меню сдвигается внутрь.',
				'- Пункты, клавиатура, подменю, флажки и ссылки — как у `BaseDropdownMenu`. После выбора пункта фокус',
				'  возвращается на элемент, с которого меню открыли.',
				'- `isDisabled` — своё меню отключено, открывается меню браузера.',
				'- Правый клик — не единственный путь: действие из контекстного меню должно быть доступно и иначе',
				'  (кнопка «…», меню у кнопки).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseContextMenu>['parameters']
