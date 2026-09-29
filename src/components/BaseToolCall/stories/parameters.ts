import type { Meta } from '@storybook/vue3-vite'
import type BaseToolCall from '../ui/BaseToolCall.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Вызов инструмента моделью: заголовок-кнопка с состоянием и сворачиваемые подробности.',
				'',
				'- `status`: `pending` — ожидает, `running` — выполняется (индикатор, без анимации при `prefers-reduced-motion`),',
				'  `success` — готово, `error` — ошибка с текстом `error`. Состояние написано словом, не только цветом.',
				'- `args` и `result` — строка как есть или JSON с отступами; своя разметка результата — слот `output`.',
				'- Слот `default` — под результатом: например, «Разрешить» и «Отклонить» для `pending`.',
				'- Состояние — `v-model:is-open`. Свёрнутое содержимое недоступно фокусу и скринридеру (`inert`).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseToolCall>['parameters']
