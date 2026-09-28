import type BasePin from '../ui/BasePin.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Ввод кода по ячейкам: PIN, код из СМС или письма. Ячейка — поле 32×32 (как инпут высотой 32px).',
				'',
				'- Ввод символа переводит фокус в следующую ячейку, Backspace очищает ячейку и возвращает назад, ←/→ — переход между ячейками.',
				'- Вставка из буфера заполняет все ячейки; когда заполнены все, приходит событие `complete`.',
				'- Ячейки подписаны «Символ 1 из 4»; имя всей группе даёт `aria-label` на компоненте или обёртка `BaseFormField`.',
				'- Ошибка (`error`) помечает ячейки `aria-invalid` и связана с ними через `aria-describedby`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BasePin>['parameters']
