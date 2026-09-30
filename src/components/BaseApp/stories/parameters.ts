import { source } from './render'
import type BaseApp from '../ui/BaseApp.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Корень приложения: показывает уведомления и окна, которые вызывают из кода. Оборачивает приложение один раз',
				'и не добавляет разметки — только слот и слои поверх страницы.',
				'',
				'- `useToast()` — уведомления: `add`, `update`, `remove`, `clear`. Уведомление с тем же `id` заменяет',
				'  показанное, `isPersistent` не закрывается само, `actions` — кнопки вроде «Отменить».',
				'- `useOverlay()` — окна и панели из кода: `create(Component).open(props)` возвращает промис с результатом',
				"  из `emit('close', value)`. Закрытое окно удаляется после анимации.",
				'- `useConfirm()` — окно подтверждения, промис с `true` или `false` (см. BaseConfirm).',
				'- `toaster` — угол экрана, время показа, лимит, оформление и масштаб уведомлений.',
				'',
				'Вызовы вне дерева BaseApp (в сторе, роутере) идут в последний смонтированный BaseApp.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseApp>['parameters']
