import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { miniProgress, miniRoadmap } from '../../demo/mini'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name" class="story-stack">
			<span class="story-label">{{ preset.label }}</span>
			<BaseRoadmap v-bind="args" :size-scale="preset.sizeScale" :aria-label="'Старт во Vue — ' + preset.label" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. Масштабируются шрифт, кольца, карточки и холст раскладки.',
			},
			source: storySource({ template, imports: ['BaseRoadmap'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	args: { data: miniRoadmap, progress: miniProgress, layout: 'list', expanded: ['basics'], selected: null, hasFilter: false },
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { data: { presets }, slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		const roots = canvas.getAllByRole('region', { name: /^Старт во Vue — / })
		await expect(roots).toHaveLength(presets.length)
		const sizes = roots.map(root => Number.parseFloat(getComputedStyle(root.querySelector('.base-roadmap__title') as Element).fontSize))
		await expect(sizes[0]).toBeLessThan(sizes[sizes.length - 1])
	},
}
