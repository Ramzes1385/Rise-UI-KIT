import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSplitter from '../ui/BaseSplitter.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Две панели с разделителем, который двигает пользователь: список и письмо, код и превью, дерево и таблица.',
				'',
				'- `v-model` — размер первой панели в процентах; `min`, `max` — границы; событие `change` — итог, чтобы сохранить его.',
				'- `orientation`: `horizontal` — панели рядом, `vertical` — одна над другой.',
				'- Доступность по APG Window Splitter: разделитель — `role="separator"` с `aria-valuenow` и `aria-controls`,',
				'  стрелки двигают его на `step`, Home/End — к границам, Enter сворачивает первую панель и возвращает её.',
				'  Имя — `label`: лучше назвать первую панель («Список писем»).',
				'- Панели с прокруткой получают tabindex, чтобы их можно было прокрутить с клавиатуры.',
				'- `variant`: `default` — линия с ручкой, `ghost` — линия видна при наведении и в фокусе.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSplitter>['parameters']
