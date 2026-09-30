import { expect } from 'storybook/test'
import type meta from '../BaseIcon.stories'
import BaseIcon from '../../ui/BaseIcon.vue'
import { ICON_SCALE } from '@utils/media/iconUtils'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const sizes = Object.entries(ICON_SCALE)

const template = `
	<div class="story-row" style="align-items: flex-end; gap: 24px;">
		<div v-for="[size, scale] in sizes" :key="size" class="story-col" style="align-items: center; gap: 8px;">
			<BaseIcon v-bind="args" :size-scale="scale" />
			<span class="story-label" style="min-width: 0;">{{ size }} · {{ (20 * scale) / 100 }}px</span>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['name', 'color'] },
		docs: {
			description: { story: 'Типовые размеры `ICON_SCALE`: xs 12px, sm 16px (иконка в кнопке и поле), md 20px, lg 28px, xl 36px.' },
			source: storySource({ template, imports: ['BaseIcon'], script: `const sizes = ${literal(sizes)}` }),
		},
	},
	render: args => ({
		components: { BaseIcon },
		setup: useStorySetup(args, { data: { sizes } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const widths = [...canvasElement.querySelectorAll('svg')].map(svg => Math.round(svg.getBoundingClientRect().width))
		await expect(widths).toEqual([12, 16, 20, 28, 36])
	},
}
