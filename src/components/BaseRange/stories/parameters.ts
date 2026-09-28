import type BaseRange from '../ui/BaseRange.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Слайдер значения: один ползунок (`v-model`), диапазон (`v-model:range-value`) или несколько точек',
				'(`v-model:points`, приоритет: points → rangeValue → modelValue).',
				'',
				'- `update:*` приходит при каждом шаге перетаскивания, `change` — когда выбор завершён: отпускание',
				'  ползунка или шаг стрелкой с клавиатуры. Сохранять значение или запускать запрос удобно по `change`.',
				'- Ползунки — `role="slider"` со стрелками; соседние ползунки не пересекаются. Имя ползунка — `ariaLabel`',
				'  («Цена» → «Цена: минимум», «Цена: максимум»).',
				'- `hasTooltip` — значение над ползунком при наведении и фокусе, `hasLabel` — минимум, значение и максимум',
				'  над треком, `marks` — деления с подписями.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseRange>['parameters']
