import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BasePagination from '../ui/BasePagination.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Пагинация переключает страницы списка или таблицы: стрелки «назад»/«вперёд», первая и последняя страницы,',
				'соседние с текущей и многоточия между разрывами.',
				'',
				'- `v-model` — номер текущей страницы (с 1); `total` и `pageSize` задают число страниц.',
				'- Кнопки — `BaseButton` высотой 32px. `variant` задаёт вид стрелок и номеров (при `default` — ghost),',
				'  текущая страница всегда залита основным цветом и помечена `aria-current="page"`.',
				'- Стрелки блокируются на краях и когда страниц нет; со страницы вне диапазона «назад» ведёт на последнюю.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BasePagination>['parameters']
