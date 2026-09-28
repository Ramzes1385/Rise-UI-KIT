import { expect } from 'storybook/test'
import type meta from '../BaseBadge.stories'
import BaseBadge from '../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: при 100 высота 20px; текст, отступы и радиус масштабируются, рамка 1px — нет.',
			},
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseBadge :size-scale="${preset.sizeScale}" label="${preset.name}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row">
				<BaseBadge v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [xs, md, xl] = ['xs · 75', 'md · 100', 'xl · 125'].map(
			label => canvas.getByText(label).closest('.base-badge')?.getBoundingClientRect().height ?? 0,
		)
		await expect(md).toBe(20)
		await expect(xs).toBeLessThan(md)
		await expect(xl).toBeGreaterThan(md)
	},
}
