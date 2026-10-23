import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCheckbox from '../ui/BaseCheckbox.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Чекбокс — одиночный выбор «да/нет»: согласие с условиями, включение опции в форме.',
				'',
				'- Нативный `input type="checkbox"` внутри `<label>`: клик по подписи переключает чекбокс, Space — с клавиатуры.',
				'- Ошибка (`error`) помечает чекбокс `aria-invalid` и связана с ним через `aria-describedby`.',
				'- Квадрат выровнен по первой строке подписи: длинный текст переносится без смещения чекбокса.',
				'',
				'Для настройки, которая применяется сразу, используйте `BaseSwitch`; для выбора одного варианта из нескольких — `BaseRadio`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseCheckbox>['parameters']
