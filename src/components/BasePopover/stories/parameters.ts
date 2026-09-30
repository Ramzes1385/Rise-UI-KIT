import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BasePopover from '../ui/BasePopover.vue'

export const parameters = {
	layout: 'centered',
	docs: {
		source,
		description: {
			component: [
				'Поповер — панель со стрелкой у элемента: пояснение, небольшая форма, дополнительные действия.',
				'',
				'- Триггер — слот `trigger`: клик по нему открывает и закрывает поповер (`v-model:is-open`). Поповер закрывается',
				'  кликом снаружи и по Escape.',
				'- `position` — сторона (`top`, `bottom`, `left`, `right`); панель и стрелка центрируются по триггеру.',
				'- Панель — это панель `BaseDropdown`: те же варианты оформления, телепорт в body и возврат фокуса на триггер',
				'  при закрытии. Поля в поповере получают фокус и ввод.',
				'',
				'Короткая подсказка при наведении — `BaseTooltip`, меню действий — `BaseDropdown` с `BaseMenu`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BasePopover>['parameters']
