import { expect } from 'storybook/test'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { BOTTOM_NAV_VARIANTS } from '../../../types/BaseBottomNav.types'

const template = `
	<div class="story-stack story-narrow">
		<BaseBottomNav v-for="variant in BOTTOM_NAV_VARIANTS" :key="variant" v-bind="args" :variant="variant" :aria-label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`default` — фон страницы и граница сверху, `soft` — приподнятый фон, `outline` — заметная граница, `ghost` — прозрачная панель. Размер из Controls применяется ко всем.',
			},
			source: storySource({ template, imports: ['BaseBottomNav', 'BOTTOM_NAV_VARIANTS'], omit: ['ariaLabel'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseBottomNav },
		setup: useStorySetup(args, { data: { BOTTOM_NAV_VARIANTS } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('navigation')).toHaveLength(BOTTOM_NAV_VARIANTS.length)
		await expect(canvas.getByRole('navigation', { name: 'ghost' })).toHaveClass('base-bottom-nav--ghost')
	},
}
