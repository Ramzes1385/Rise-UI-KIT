import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseButtonGroup from '../ui/BaseButtonGroup.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Склеенные кнопки связанных действий: выравнивание текста, навигация «назад / вперёд», вид списка.',
				'',
				'- Группа — `role="group"` с именем `ariaLabel`; каждая кнопка — отдельный таб-стоп (для стрелок между кнопками — BaseToolbar).',
				'- У крайних кнопок внешние скругления, соседние рамки совпадают; кнопка в фокусе — поверх соседей.',
				'- Вид задают кнопки: один вариант для всех кнопок группы.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseButtonGroup>['parameters']
