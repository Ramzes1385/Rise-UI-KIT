import type BaseChart from '../ui/BaseChart.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'График рядов по общей оси X: линии (`line`), области (`area`) и столбики (`bar`, группами или стопкой при `isStacked`). Своё SVG, без библиотек.',
				'',
				'- Оси с «круглыми» метками, подписи и значения — через `Intl` языка кита (`valueFormat`, `labelFormat`) или свои функции формата.',
				'- Подсказка у ближайшей точки при наведении; легенда — кнопки скрытия рядов (`v-model:hidden-series`).',
				'- Цвета рядов — токены `--rise-chart-1…8` в обеих темах; свой цвет — `series[].color`.',
				'- Доступность: область графика — `role="img"` со сводкой, по Tab — фокус, стрелки, Home/End, PageUp/PageDown переходят по точкам и объявляют значения в `role="status"`; полная таблица данных — для скринридера.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseChart>['parameters']
