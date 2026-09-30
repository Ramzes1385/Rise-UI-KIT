import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseToolbar from '../ui/BaseToolbar.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Панель инструментов: форматирование текста, действия над выбранными строками, управление просмотром.',
				'',
				'- По образцу APG Toolbar: `role="toolbar"` с именем `ariaLabel`, в порядке Tab один элемент (последний с фокусом).',
				'- ←/→ (у вертикальной — ↑/↓) ведут по элементам с переходом через край, Home/End — первый и последний.',
				'  В текстовом поле стрелки двигают курсор. Отключённые кнопки пропускаются.',
				'- Внутри — любые кнопки, меню (BaseDropdownMenu), поля и разделители (BaseSeparator).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseToolbar>['parameters']
