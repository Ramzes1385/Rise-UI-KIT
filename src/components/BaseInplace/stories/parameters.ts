import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseInplace from '../ui/BaseInplace.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Текст с правкой на месте: название проекта, имя в профиле, заметка в строке таблицы.',
				'',
				'- В просмотре — кнопка: скринридер слышит «что: значение» и подсказку «Нажмите, чтобы изменить».',
				'- Клик, Enter или пробел открывают поле с выделенным текстом; Enter сохраняет, Escape отменяет, выход из поля сохраняет',
				'  (`isSaveOnBlur=false` — отменяет). После правки фокус возвращается на кнопку.',
				'- Шрифт наследуется: подходит для заголовков и строк таблиц. Слот `display` — свой вид значения.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseInplace>['parameters']
