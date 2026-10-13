import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { layer: 'layer' } as const

const template = `
	<div class="story-stack">
		<BaseButton variant="outline" @click="layer = layer === 'floor-1' ? 'floor-2' : 'floor-1'">Сменить этаж</BaseButton>
		<div class="story-medium">
			<BaseImageMap3D v-bind="args" v-model:layer="layer" />
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['camera', 'layerMode', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Движение 3D-карты берётся из токенов области. Кнопки камеры (поворот, наклон, масштаб, сброс), смена этажа и рисование',
					'маршрута идут по `--rise-duration-xslow` и тянутся `useTween`; сообщение о загрузке или ошибке проявляется через',
					"`--rise-duration` с задержкой `--rise-duration-slow`. Выключить движение — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`: камера и этажи встают сразу; системная настройка «уменьшить движение» действует всегда.",
					'Холст WebGL тяжёлый, поэтому один экземпляр, а не колонки четырёх пресетов: пресет области задаёт `data-rise-motion`',
					'на контейнере карты. «Сменить этаж» переключает этаж и ведёт камеру.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton'],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				models: MODELS,
				types: { layer: 'string' },
			}),
		},
	},
	args: { layer: 'floor-1', layerMode: 'stack' },
	render: args => ({
		components: { BaseImageMap3D, BaseButton },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить этаж' }))
		await waitFor(() => expect(canvas.getByRole('radio', { name: '2' })).toBeChecked())
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить этаж' }))
		await waitFor(() => expect(canvas.getByRole('radio', { name: '1' })).toBeChecked())
	},
}
