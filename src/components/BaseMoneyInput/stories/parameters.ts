import type { Meta } from '@storybook/vue3-vite'
import type BaseMoneyInput from '../ui/BaseMoneyInput.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле суммы: разряды расставляются при вводе, знак валюты стоит там, где принято в языке кита',
				'(«1 234,50 ₽», «$1,234.50»). `v-model` — число или `null`.',
				'',
				'- `currency` — код ISO 4217: от него зависят знак и число знаков после запятой (у иены — ни одного).',
				'- Запятая и точка обе ставят десятичный разделитель; лишние знаки и буквы отбрасываются, курсор не прыгает.',
				'- После ухода из поля сумма округляется и приводится к `min` и `max`. Отрицательные суммы — только при `min` < 0.',
				'- Клавиатура на телефоне — цифровая (`inputmode="decimal"`).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseMoneyInput>['parameters']
