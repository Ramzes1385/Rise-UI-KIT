import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { IMAGE_MAP_MALL_ROUTES } from '../../routesFixtures'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { layer: 'layer', route: 'route' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap v-bind="args" v-model:layer="layer" v-model:route="route" />
	</div>
`

export const Routes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Маршруты, как wayfinding: `data.routes` — граф путей торгового центра в три этажа. Узлы в долях плана, коридоры между узлами этажа, переходы между этажами — лестница, лифт и эскалатор только вверх. Вход магазина — узел с его `object`.',
					'Панель «Как пройти» (`hasRoutes`): «Откуда» и «Куда» с поиском, «Поменять местами», «Без лестниц» (только лифт). Кратчайший путь рисуется линией с бегущим пунктиром на текущем этаже (без движения при reduced motion), метки — начало, переходы и конец.',
					'Для скринридера маршрут дублируется текстом: итог в `role="status"` и шаги нумерованным списком; выбор шага показывает его этаж. «Служебное помещение» на 3 этаже не связано с коридором — «Маршрут не найден». Запрос — `v-model:route`, результат — событие `route-change`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImageMap', 'type ImageMapRouteValue'],
				models: MODELS,
				types: { layer: 'string', route: 'ImageMapRouteValue | null' },
			}),
		},
	},
	args: { data: IMAGE_MAP_MALL_ROUTES, hasRoutes: true, layer: 'floor-1', route: null, hasFullscreen: false },
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const panel = within(canvas.getByRole('region', { name: 'Как пройти' }))
		const from = panel.getByRole('combobox', { name: 'Откуда' })
		await tabTo(from, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await userEvent.keyboard('Кофе')
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(from).toHaveTextContent('Кофейня'))
		const to = panel.getByRole('combobox', { name: 'Куда' })
		await tabTo(to, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await userEvent.keyboard('Кино')
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(panel.getByRole('status')).toHaveTextContent(/Маршрут от «Кофейня» до «Кино»/))
		const steps = panel.getByRole('list', { name: 'Шаги маршрута' })
		await expect(within(steps).getAllByRole('listitem')).toHaveLength(4)
		await expect(canvasElement.querySelector('.base-image-map__route-path')).not.toBeNull()
		await userEvent.click(panel.getByRole('switch', { name: 'Без лестниц' }))
		await waitFor(() => expect(within(steps).getAllByRole('listitem')[1]).toHaveTextContent('лифту'))
		await userEvent.click(within(steps).getByRole('button', { name: /Поднимитесь на лифте/ }))
		await waitFor(() => expect(canvas.getByRole('radio', { name: '3' })).toBeChecked())
	},
}
