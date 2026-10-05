import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type { BaseVirtualListProps } from '../types/BaseVirtualList.types'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Список на тысячи строк: в DOM только видимые строки и небольшой запас, остальные — высотой внутреннего блока.',
				'',
				'- `items` и слот по умолчанию (`item`, `index`); `itemKey` — поле или функция ключа (по умолчанию `id`).',
				'- `itemSize` — высота строки до замера: строки замеряются после отрисовки, разная высота допустима.',
				'- `height` — высота области; `overscan` — сколько строк держать сверх видимых.',
				'- Доступность: `role="list"` с именем (`ariaLabel`), строки — `listitem` с `aria-setsize` и `aria-posinset`,',
				'  чтобы скринридер знал длину всего списка. Область с прокруткой — в порядке Tab; строка с фокусом',
				'  не уходит из DOM при прокрутке.',
				'- `scrollToIndex(index, align)` через ref. Под капотом — composable `useVirtualList`.',
				'- Перекраска — токены `--rise-virtual-list-*` (фон, радиус, отступы строки), классы частей — проп `ui` (история «Токены»);',
				'  своего движения нет, появление — через `BaseAnimation` (история «Анимации»).',
			].join('\n'),
		},
	},
} satisfies Meta<BaseVirtualListProps<Record<string, unknown>>>['parameters']
