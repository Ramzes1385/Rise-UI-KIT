import type { Meta } from '@storybook/vue3-vite'
import type BaseSeparator from '../ui/BaseSeparator.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Разделитель групп содержимого: секций карточки, пунктов меню, кнопок тулбара.',
				'',
				'- Линия 1px цвета рамок (`--rise-border`); `isDashed` — пунктир, `thickness` — толщина.',
				'- `label` или слот ставят подпись между двумя линиями: «или» в форме входа, дата в ленте сообщений.',
				'- `orientation="vertical"` — вертикальная линия во всю высоту ряда (тулбары, строки с метаданными).',
				'- Доступность: `role="separator"` с `aria-orientation`; подпись — имя разделителя через `aria-labelledby`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSeparator>['parameters']
