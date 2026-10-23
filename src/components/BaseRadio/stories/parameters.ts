import { source } from './render'
import type BaseRadio from '../ui/BaseRadio.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Группа радиокнопок — выбор одного варианта из нескольких видимых: способ доставки, тариф, формат файла.',
				'',
				'- Группа объявлена `role="radiogroup"`, её имя — заголовок `label`; ошибка (`error`) описывает группу и помечает её `aria-invalid`.',
				'- Нативные radio с общим `name`: один таб-стоп на группу, стрелки переключают выбор. `name` должен быть уникальным на странице.',
				'- Слот `option` заменяет только подпись опции — круг, выбор и клавиатура остаются.',
				'- `bordered` — опции-кнопки высотой 36px для короткого выбора («S / M / L»).',
				'',
				'Для одного флага «да/нет» используйте `BaseCheckbox` или `BaseSwitch`; для длинного списка — `BaseSelect`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseRadio>['parameters']
