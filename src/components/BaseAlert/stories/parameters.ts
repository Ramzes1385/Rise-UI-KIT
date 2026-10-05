import type BaseAlert from '../ui/BaseAlert.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Оповещение на странице: результат действия, предупреждение, ошибка, подсказка.',
				'',
				'- `type` — роль и иконка: `info`, `success`, `warning`, `error`.',
				'- `variant` — как применяется цвет роли: `default` — заливка, `soft` — мягкий фон, `outline` — рамка,',
				'  `ghost` — только текст, `shadow` — нейтральная карточка с тенью.',
				'- Доступность: `error` и `warning` — `role="alert"` (озвучиваются сразу), `info` и `success` — `role="status"` (вежливо).',
				'- `isClosable` добавляет кнопку «Закрыть»: алерт уходит с анимацией и сообщает `close`, родитель убирает его (`v-if`).',
				'  Слот `actions` — кнопки справа.',
				'- Перекраска — токены `--rise-alert-*`, классы частей — проп `ui` (история «Токены»).',
				'',
				'Всплывающие уведомления — `BaseNotification`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseAlert>['parameters']
