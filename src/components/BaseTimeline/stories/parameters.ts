import type { Meta } from '@storybook/vue3-vite'
import type BaseTimeline from '../ui/BaseTimeline.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Лента событий: история заказа, изменения документа, этапы процесса.',
				'',
				'- Разметка — упорядоченный список `<ol>`; дата — `<time datetime>` в формате языка (`dateFormat`), строка не-дата выводится как есть.',
				'- `currentId` — текущее событие: `aria-current="step"`, следующие приглушены как предстоящие.',
				'- Маркер — иконка события или точка, цвет — роль (`color`: success, warning, error, info, neutral).',
				'- `orientation="horizontal"` — лента слева направо с прокруткой; слот `item` — своё содержимое события.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseTimeline>['parameters']
