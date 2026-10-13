import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { MOSCOW, OFFICES, ROUTE, ZONES, liveOrDemo } from '../../shared'
import { literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const markers = OFFICES.slice(0, 3)

const template = `<BaseMap v-bind="args" :markers="markers" :polylines="polylines" :polygons="polygons" />`

export const Shapes: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'`polylines` — маршруты, `polygons` — зоны (контур и полупрозрачная заливка того же цвета). `color` — токен кита (`var(--rise-primary)`) или любой CSS-цвет:',
					'токен кит сам переводит в цвет текущей темы, поэтому линия остаётся читаемой в светлой и тёмной теме; явный цвет (оранжевый маршрут и фиолетовая зона) остаётся как задан. `width` — толщина контура в px.',
					'Графика карты недоступна экранному диктору, поэтому `title` каждой фигуры попадает в скрытый список с именем «Линии и области на карте»;',
					'без `title` подпись строится из `id`. С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMap'],
				script: `const markers = ${literal(markers)}\n\nconst polylines = ${literal(ROUTE)}\n\nconst polygons = ${literal(ZONES)}`,
			}),
			story: { inline: false, height: '440px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height', 'zoom'] },
	},
	args: { ...liveOrDemo.args, center: MOSCOW, zoom: 11 },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { data: { markers, polylines: ROUTE, polygons: ZONES } }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const map = canvas.getByRole('region', { name: 'Карта' })
		await waitFor(() => expect(within(map).getByRole('button', { name: 'Арбат' })).toBeInTheDocument())
		const list = canvas.getByRole('list', { name: 'Линии и области на карте' })
		const labels = within(list).getAllByRole('listitem')
		await expect(labels.map(item => item.textContent)).toEqual(['Маршрут курьера', 'Линия walk', 'Зона доставки', 'Закрытая зона'])
		if (canvasElement.querySelector('.story-demo-map') === null) return
		const lines = canvasElement.querySelectorAll('polyline')
		const areas = canvasElement.querySelectorAll('polygon')
		await expect(lines).toHaveLength(2)
		await expect(areas).toHaveLength(2)
		await expect(lines[0]?.getAttribute('stroke')).toMatch(/^rgb/)
		await expect(lines[0]?.getAttribute('stroke-width')).toBe('5')
		await expect(lines[1]?.getAttribute('stroke')).toBe('rgb(232, 89, 12)')
		await expect(areas[0]?.getAttribute('fill')).toMatch(/^rgb/)
	},
}
