import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { miniProgress, miniRoadmap } from '../../demo/mini'
import { storySource, useStorySetup } from '@/stories/helpers'
import { ROADMAP_VARIANTS } from '../../../types/BaseRoadmap.types'

const template = `
	<div class="story-stack">
		<BaseRoadmap
			v-for="variant in ROADMAP_VARIANTS"
			:key="variant"
			v-bind="args"
			:variant="variant"
			:aria-label="'Старт во Vue — ' + variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Все варианты оформления: `default` — на фоне страницы, `outline` — с рамкой, `ghost` — без фона. Размер из Controls применяется ко всем.',
			},
			source: storySource({ template, imports: ['BaseRoadmap', 'ROADMAP_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	args: { data: miniRoadmap, progress: miniProgress, layout: 'list', expanded: ['basics'], selected: null },
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { data: { ROADMAP_VARIANTS }, slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('region', { name: /^Старт во Vue — / })).toHaveLength(ROADMAP_VARIANTS.length)
	},
}
