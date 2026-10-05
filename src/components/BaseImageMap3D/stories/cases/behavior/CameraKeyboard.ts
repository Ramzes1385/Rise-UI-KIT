import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { layer: 'layer' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:layer="layer" />
	</div>
`

export const CameraKeyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Камера с клавиатуры и кнопок. В области карты: Shift + ←/→ — поворот на 15°, Shift + ↑/↓ — наклон, + и − — масштаб, 0 — исходный вид; мышью — вращение и наклон, сдвиг правой кнопкой, масштаб — Ctrl + колесо (как у BaseImageMap). Переходы плавные (450–500 мс по токену `--rise-duration-xslow`), при «уменьшить движение» — сразу. `camera: perspective` — перспектива вместо изометрии.',
			},
			source: storySource({ template, imports: ['BaseImageMap3D'], models: MODELS, types: { layer: 'string' } }),
		},
	},
	args: { layer: 'floor-2', camera: 'perspective' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const zoomOut = canvas.getByRole('button', { name: 'Уменьшить' })
		await tabTo(zoomOut, userEvent)
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(zoomOut).toHaveAttribute('aria-disabled', 'true'))
		await expect(zoomOut).toHaveFocus()
		const region = canvas.getByRole('group', { name: 'Этаж 1' })
		await tabTo(region, userEvent)
		await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowUp}{/Shift}')
		await userEvent.keyboard('0')
		await waitFor(() => expect(zoomOut).not.toHaveAttribute('aria-disabled'))
		await expect(region).toHaveFocus()
	},
}
