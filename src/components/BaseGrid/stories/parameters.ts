import { source } from './render'
import type BaseGrid from '../ui/BaseGrid.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	layout: 'padded',
	docs: {
		source,
		description: {
			component: [
				'Сетка — двумерная раскладка на колонки равной ширины (CSS Grid): карточки, формы в несколько колонок, панели.',
				'',
				'- `cols` — число колонок (по умолчанию 12) или объект по брейкпоинтам `{ base, sm, md, lg, xl }`; значение действует от своего брейкпоинта и выше (`sm` 480px, `md` 768px, `lg` 1024px, `xl` 1440px). Колонки не растягиваются длинным содержимым.',
				'- `gap` и `rowGap` — промежутки `none`, `xs` 4px, `sm` 8px, `md` 16px (по умолчанию), `lg` 24px, `xl` 32px; `sizeScale` масштабирует их.',
				'- Ячейка — `BaseGridItem`: `span` (сколько колонок занять, `full` — всю строку), `offset` (номер колонки начала минус один), `order` (порядок показа; для Tab и скринридера остаётся исходный). Все три принимают объект по брейкпоинтам. Обычный элемент в сетке занимает одну колонку.',
				'- Брейкпоинты считаются по ширине окна, а не контейнера. `tag` — тег корня сетки и ячейки.',
				'',
				'Одномерный ряд или столбец — `BaseStack`; ширину страницы ограничивает `BaseContainer`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseGrid>['parameters']
