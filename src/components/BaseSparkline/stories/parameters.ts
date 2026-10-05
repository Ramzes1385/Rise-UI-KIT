import type { Meta } from '@storybook/vue3-vite'
import type BaseSparkline from '../ui/BaseSparkline.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Мини-график тренда без осей: для карточек показателей, строк таблицы и списков.',
				'',
				'- `variant` — линия, линия с заливкой (10% цвета) или столбики; ширина — по контейнеру, высота — `height`.',
				'- Цвет — `markColor` (по умолчанию основной цвет кита); точка отмечает последнее значение.',
				'- Наведение показывает значение и подпись из `labels`. Скринридер слышит сводку: «от … до …, последнее …»,',
				'  поэтому подсказка ничего не скрывает.',
				'- Перекраска — токены `--rise-sparkline-*`, классы частей — проп `ui` (история «Токены»); движение — история «Анимации».',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSparkline>['parameters']
