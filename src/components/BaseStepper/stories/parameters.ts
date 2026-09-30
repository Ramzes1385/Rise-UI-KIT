import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseStepper from '../ui/BaseStepper.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Степпер показывает прогресс многошагового процесса: оформление заказа, регистрация, мастер настройки.',
				'',
				'- `v-model` — номер текущего шага (с 1). Пройденные шаги отмечены галочкой, текущий — кольцом,',
				'  линия между шагами заполняется до текущего.',
				'- Клик по шагу, Enter или Space эмитят `update:modelValue` и `change`; отключённый шаг (`isDisabled`) недоступен.',
				'  Шаг — кнопка, текущий помечен `aria-current="step"`.',
				'- Ориентация `horizontal` / `vertical`, формы индикатора `circle`, `square`, `diamond`, `empty`,',
				'  вариант `animated` плавно заполняет линию.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseStepper>['parameters']
