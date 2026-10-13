import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { IMAGE_MAP_FLOORS } from '@components/BaseImageMap/stories/fixtures'

const MODELS = { layer: 'layer' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:layer="layer" />
	</div>
`

export const Fullscreen3D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кнопка «Во весь экран» (`hasFullscreen`, по умолчанию включена) стоит в панели камеры рядом с масштабом. Карта разворачивается через Fullscreen API; там, где API нет (iPhone), — запасной режим: слой поверх страницы с блокировкой прокрутки. Выход — той же кнопкой или клавишей Escape, фокус возвращается на кнопку.',
					'Сцена занимает всю область: в полноэкранном режиме соотношение сторон и `height` не применяются. Браузер может отказать в Fullscreen API без жеста пользователя — карта остаётся в обычном режиме.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				models: MODELS,
				types: { layer: 'string' },
			}),
		},
	},
	args: { data: IMAGE_MAP_FLOORS, hasFullscreen: true, layer: 'floor-1', height: '320px' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		const camera = within(canvas.getByRole('group', { name: 'Камера' }))
		const button = camera.getByRole('button', { name: 'Во весь экран' })
		await expect(button).toHaveAttribute('aria-pressed', 'false')
		await tabTo(button, userEvent)
		await expect(button).toHaveFocus()
	},
}
