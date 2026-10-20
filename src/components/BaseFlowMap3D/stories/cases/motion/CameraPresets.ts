import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowScene, waitForCanvas } from '../../shared'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { camera: 'camera' } as const

const presets = ['iso', 'iso-90', 'iso-180', 'iso-270', 'top', 'perspective']

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton
				v-for="preset in presets"
				:key="preset"
				:variant="camera === preset ? 'primary' : 'outline'"
				:aria-pressed="camera === preset"
				@click="camera = preset">
				{{ preset }}
			</BaseButton>
		</div>
		<BaseFlowMap3D v-bind="args" v-model:camera="camera" />
	</div>
`

export const CameraPresets: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Пресеты камеры: `iso` — изометрия, `iso-90`, `iso-180` и `iso-270` — она же, повёрнутая на четверть оборота, `top` — вид сверху (переход к 2D), `perspective` — перспектива. Смена пресета — плавный переход камеры; при «уменьшить движение» камера встаёт сразу.',
					'`v-model:camera` ведёт пресет в обе стороны: кнопки выше задают его, а нижняя панель (кнопки «1» и «2»), клавиши Q и E и кнопки поворота возвращают новое значение. Без `camera` берётся `data.view3d.camera`. Вращение мышью и наклон меняют вид, но не пресет — событие `update:camera` приходит только для изометрии.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton'],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
				models: MODELS,
				types: { camera: 'Scene3DCameraPreset' },
				script: `const presets = ${JSON.stringify(presets).replaceAll('"', "'")}`,
			}),
		},
	},
	args: { camera: 'iso' },
	render: args => ({
		components: { BaseFlowMap3D, BaseButton },
		setup: useStorySetup(args, { models: MODELS, data: { presets } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitForCanvas(canvasElement)
		const pressed = (name: string): HTMLElement => canvas.getByRole('button', { name })
		await expect(pressed('iso')).toHaveAttribute('aria-pressed', 'true')
		await userEvent.click(pressed('iso-90'))
		await waitFor(
			() => expect(canvas.getByRole('button', { name: 'Вид 2: изометрия, поворот на 90°' })).toHaveAttribute('aria-pressed', 'true'),
			{ timeout: 3000 },
		)
		await userEvent.click(canvas.getByRole('button', { name: 'Вид 1: изометрия' }))
		await waitFor(() => expect(pressed('iso')).toHaveAttribute('aria-pressed', 'true'), { timeout: 3000 })
		flowScene(canvas).focus()
		await expect(flowScene(canvas)).toHaveFocus()
		await userEvent.keyboard('e')
		await waitFor(() => expect(pressed('iso')).toHaveAttribute('aria-pressed', 'false'), { timeout: 3000 })
		await userEvent.click(pressed('top'))
		await waitFor(() => expect(pressed('top')).toHaveAttribute('aria-pressed', 'true'), { timeout: 3000 })
	},
}
