import { expect } from 'storybook/test'
import type meta from '../BaseEmpty.stories'
import BaseEmpty from '../../ui/BaseEmpty.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'icon'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: отступы, иконка и текст масштабируются вместе.' },
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseEmpty :size-scale="${preset.sizeScale}" title="${preset.name}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEmpty },
		setup: () => ({ props: useArgsWithoutSlots(args, ['title', 'description']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px; align-items: start;">
				<BaseEmpty
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:size-scale="preset.sizeScale"
					:title="sizeLabel(preset)"
					description="Создайте первую задачу." />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { name: 'xl · 125' })
		await expect(getComputedStyle(title).fontSize).toBe('17.5px')
		await expect(getComputedStyle(title.closest('.base-empty') as HTMLElement).padding).toBe('40px 30px')
	},
}
