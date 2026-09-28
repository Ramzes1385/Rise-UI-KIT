import type { Meta } from '@storybook/vue3-vite'
import type BaseColorPicker from '../ui/BaseColorPicker.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Выбор цвета: образец-триггер открывает панель с областью насыщенности и яркости, слайдером тона,',
				'полем HEX и пресетами.',
				'',
				'- `v-model` — цвет в HEX. Пресет и введённый HEX попадают в модель как есть, без пересчёта через HSV.',
				'- Выбор пресета и сброс (`isResettable`) закрывают панель; область, тон и HEX — нет, можно подбирать дальше.',
				'- Клавиатура: Enter на образце открывает панель, Tab переходит по её элементам, стрелки меняют',
				'  насыщенность и яркость (Shift — шаг 10%) и тон, Escape закрывает панель и возвращает фокус на образец.',
				'',
				'Проп `color` компонент не использует: цвет образца — это выбранное значение.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseColorPicker>['parameters']
