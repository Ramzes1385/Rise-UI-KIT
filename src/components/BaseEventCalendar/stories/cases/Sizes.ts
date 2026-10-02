import type meta from '../BaseEventCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseEventCalendar from '../../ui/BaseEventCalendar.vue'
import { literal, SIZE_PRESETS, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale }))

const template = `<div class="story-row"><BaseEventCalendar v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" /></div>`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({ template, imports: ['BaseEventCalendar'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseEventCalendar },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
