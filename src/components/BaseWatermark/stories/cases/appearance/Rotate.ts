import { expect } from 'storybook/test'
import type meta from '../../BaseWatermark.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseWatermark from '../../../ui/BaseWatermark.vue'
import { watermarkLayer, waitForPattern } from '../../shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const angles = [0, -22, -45]

const template = `
	<div class="story-row">
		<BaseWatermark v-for="angle in angles" :key="angle" v-bind="args" :rotate="angle">
			<div class="story-frame story-stack">
				<strong>Поворот {{ angle }}°</strong>
				<span>Накладная № 2041 от 13 октября.</span>
			</div>
		</BaseWatermark>
	</div>
`

export const Rotate: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['content', 'gap', 'opacity', 'fontSize'] },
		docs: {
			description: {
				story: [
					'`rotate` — поворот знака в градусах по часовой стрелке: 0, -22 (по умолчанию) и -45. `gap` задаёт расстояние между знаками:',
					'число для обеих осей или пара `[по горизонтали, по вертикали]`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseWatermark'], script: `const angles = ${literal(angles)}` }),
		},
	},
	args: { content: 'Копия', gap: [40, 40] },
	render: args => ({
		components: { BaseWatermark },
		setup: useStorySetup(args, { data: { angles } }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const layers = canvasElement.querySelectorAll<HTMLElement>('.base-watermark__layer')
		await expect(layers).toHaveLength(3)
		for (const layer of layers) await waitForPattern(layer)
		await expect(canvas.getByText('Поворот -45°')).toBeVisible()
		await expect(watermarkLayer(canvasElement)).toHaveAttribute('aria-hidden', 'true')
	},
}
