import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name">
			<span class="story-label">{{ preset.label }}</span>
			<BaseFlowMap v-bind="args" :size-scale="preset.sizeScale" :aria-label="'Карта: ' + preset.label" height="440px" :panels="['toolbar']" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. Масштабируются карточки, подписи, шапка и панели; область холста задаёт `height`.',
			},
			source: storySource({
				template,
				imports: ['BaseFlowMap'],
				script: `const presets = ${literal(presets)}`,
				omit: ['sizeScale', 'height', 'panels'],
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
	play: async ({ canvas }) => {
		const headers = SIZE_PRESETS.map(preset =>
			canvas.getByRole('region', { name: `Карта: ${sizeLabel(preset)}` }).querySelector<HTMLElement>('.base-flow-map__header')!,
		)
		const heights = headers.map(header => header.getBoundingClientRect().height)
		await expect(heights[0]).toBeLessThan(heights[2])
		await expect(heights[2]).toBeLessThan(heights[4])
	},
}
