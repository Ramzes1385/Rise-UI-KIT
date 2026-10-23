import { TO, TO_SCRIPT } from '../../shared'
import type meta from '../../BaseCountdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../../ui/BaseCountdown.vue'
import { literal, SIZE_PRESETS, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale }))

const template = `<div class="story-stack"><BaseCountdown v-for="preset in presets" :key="preset.name" v-bind="args" :to="to" :size-scale="preset.sizeScale" /></div>`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({
				template,
				imports: ['BaseCountdown'],
				script: `${TO_SCRIPT}\nconst presets = ${literal(presets)}`,
				omit: ['to'],
			}),
		},
		controls: { include: ['variant', 'layout'] },
	},
	render: args => ({
		components: { BaseCountdown },
		setup: useStorySetup(args, { data: { presets, to: TO }, slots: ['to'] }),
		template,
	}),
}
