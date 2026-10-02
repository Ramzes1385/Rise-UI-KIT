import { source } from './render'
import type BaseChart from '../ui/BaseChart.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'График рядов по общей оси X: линии (`line`), области (`area`) и столбики (`bar`, группами или стопкой при `isStacked`). Своё SVG, без библиотек. Для одного ряда без осей в плитке — BaseSparkline, для долей целого — BasePieChart.',
				'',
				'- Оси с «круглыми» метками, подписи и значения — через `Intl` языка кита (`valueFormat`, `labelFormat`) или свои функции формата; `null` в ряду — разрыв линии.',
				'- Подсказка у ближайшей точки при наведении и при переходе стрелками; своё содержимое — слот `tooltip`. Легенда — кнопки-переключатели рядов (`v-model:hidden-series`).',
				'- Цвета рядов — токены `--rise-chart-1…8` в обеих темах; свой цвет — `series[].color`.',
				'- Доступность: область графика — `role="img"` со сводкой; по Tab — фокус, стрелки, Home/End, PageUp/PageDown переходят по точкам и объявляют значения в `role="status"`, Escape снимает выбор; полная таблица данных — для скринридера.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseChart>['parameters']
