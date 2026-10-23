import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseInputNumber from '../ui/BaseInputNumber.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Поле числа: количество, возраст, сумма с шагом. Кнопки −/+ по краям, ввод с клавиатуры, границы `min`/`max`.',
				'',
				'- По образцу APG Spinbutton: поле — `role="spinbutton"` с `aria-valuenow`/`min`/`max`; ↑/↓ — шаг, PageUp/PageDown — десять шагов, Home/End — границы.',
				'- Кнопки −/+ вне порядка Tab (с клавиатуры шагают стрелки) и отключаются на границе.',
				'- Ввод принимает `1,5` и `1.5`; число вне границ поднимается или опускается до границы при выходе из поля, нечисло возвращает прежнее значение.',
				'- `precision` — знаков после запятой (по умолчанию — как у шага); `formatValueText` — текст значения для скринридера.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseInputNumber>['parameters']
