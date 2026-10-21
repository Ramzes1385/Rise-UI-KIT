import type { Meta } from '@storybook/vue3-vite'
import type BaseButton from '../ui/BaseButton.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Кнопка запускает действие: отправку формы, открытие окна, переход к следующему шагу.',
				'',
				'- `default` — главное действие; на экране или в области обычно одно.',
				'- `soft` — второстепенное действие, которое стоит выделить цветом.',
				'- `outline`, `ghost`, `shadow` — нейтральные действия: «Отмена», кнопки тулбаров и карточек.',
				'',
				'Размер задаёт `sizeScale` (100 — высота 36px). Во время `isLoading` кнопка остаётся в порядке Tab',
				'(`aria-busy`, `aria-disabled`), а клики и отправка формы подавляются.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseButton>['parameters']
