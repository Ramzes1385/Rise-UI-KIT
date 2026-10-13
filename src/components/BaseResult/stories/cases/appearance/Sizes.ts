import { expect } from 'storybook/test'
import type meta from '../../BaseResult.stories'
import BaseResult from '../../../ui/BaseResult.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack story-medium">
		<BaseResult v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :title="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	args: { variant: 'outline' },
	parameters: {
		controls: { include: ['status', 'variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. Отступы, круг с иконкой, иконка и тексты масштабируются вместе.',
			},
			source: storySource({ template, imports: ['BaseResult'], script: `const presets = ${literal(presets)}` }),
		},
	},
	render: args => ({
		components: { BaseResult },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const wrappers = Array.from(canvasElement.querySelectorAll<HTMLElement>('.base-result__icon-wrapper'))
		await expect(wrappers).toHaveLength(presets.length)
		await expect(wrappers[2].getBoundingClientRect().height).toBe(64)
		await expect(wrappers[0].getBoundingClientRect().height).toBeLessThan(wrappers[4].getBoundingClientRect().height)
	},
}
