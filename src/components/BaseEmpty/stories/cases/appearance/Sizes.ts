import { expect } from 'storybook/test'
import type meta from '../../BaseEmpty.stories'
import BaseEmpty from '../../../ui/BaseEmpty.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-grid" style="--story-grid-min: 220px; align-items: start;">
		<BaseEmpty
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:size-scale="preset.sizeScale"
			:title="preset.label"
			description="Создайте первую задачу." />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'icon'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: отступы, иконка и текст масштабируются вместе.' },
			source: storySource({
				template,
				imports: ['BaseEmpty'],
				script: `const presets = ${literal(presets)}`,
				omit: ['title', 'description', 'sizeScale'],
			}),
		},
	},
	render: args => ({
		components: { BaseEmpty },
		setup: useStorySetup(args, { data: { presets }, slots: ['title', 'description'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { name: 'xl · 125' })
		await expect(getComputedStyle(title).fontSize).toBe('17.5px')
		await expect(getComputedStyle(title.closest('.base-empty') as HTMLElement).padding).toBe('40px 30px')
	},
}
