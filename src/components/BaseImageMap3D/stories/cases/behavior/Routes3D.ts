import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { IMAGE_MAP_MALL_ROUTES } from '@components/BaseImageMap/stories/routesFixtures'

const MODELS = { layer: 'layer', route: 'route' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:layer="layer" v-model:route="route" />
	</div>
`

export const Routes3D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Маршрут в 3D по тому же `data.routes`, что у BaseImageMap: трубка идёт по узлам пути на высоте их этажей, на лестнице, лифте или эскалаторе — вертикальный участок между этажами; метки — начало и конец. Линия вырастает от начала к концу за `--rise-duration-xslow`, при «уменьшить движение» — сразу целиком.',
					'Панель «Как пройти» — та же, что в 2D (`hasRoutes`): «Откуда», «Куда», «Без лестниц», итог в `role="status"` и шаги списком; выбор шага показывает его этаж, камера переезжает на его высоту. Запрос — `v-model:route`, результат — событие `route-change`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImageMap3D', 'type ImageMapRouteValue'],
				models: MODELS,
				types: { layer: 'string', route: 'ImageMapRouteValue | null' },
			}),
		},
	},
	args: {
		data: IMAGE_MAP_MALL_ROUTES,
		hasRoutes: true,
		layer: 'floor-1',
		route: { from: 'f1-shop-1', to: 'f3-shop-1', isStepFree: false },
	},
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		const panel = within(canvas.getByRole('region', { name: 'Как пройти' }))
		await waitFor(() => expect(panel.getByRole('status')).toHaveTextContent(/Маршрут от «Кофейня» до «Кино»/))
		const steps = within(panel.getByRole('list', { name: 'Шаги маршрута' })).getAllByRole('button')
		const last = steps[steps.length - 1] as HTMLElement
		await tabTo(last, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('radio', { name: '3' })).toBeChecked())
		await expect(last).toHaveFocus()
	},
}
