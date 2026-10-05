import { expect } from 'storybook/test'
import { PRIMARY_ITEMS } from '../../shared'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { BOTTOM_NAV_VARIANTS } from '../../../types/BaseBottomNav.types'

const template = `
	<div class="story-stack story-narrow">
		<BaseBottomNav
			v-for="variant in BOTTOM_NAV_VARIANTS"
			:key="variant"
			v-bind="args"
			:items="PRIMARY_ITEMS"
			:variant="variant"
			:aria-label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Витрина всех вариантов. Классика: `default` — фон страницы и граница сверху, `soft` — приподнятый фон, `outline` — заметная граница, `ghost` — прозрачная панель. Новые: `floating` — парящая панель, `glass` — полупрозрачная с размытием, `notched` — вырез под главное действие («Создать», `isPrimary`); в остальных вариантах этот пункт обычный. Размер из Controls применяется ко всем.',
			},
			source: storySource({
				template,
				imports: ['BaseBottomNav', 'BOTTOM_NAV_VARIANTS'],
				omit: ['ariaLabel', 'items'],
				script: `const PRIMARY_ITEMS = ${literal(PRIMARY_ITEMS)}`,
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseBottomNav },
		setup: useStorySetup(args, { data: { BOTTOM_NAV_VARIANTS, PRIMARY_ITEMS } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('navigation')).toHaveLength(BOTTOM_NAV_VARIANTS.length)
		await expect(canvas.getByRole('navigation', { name: 'ghost' })).toHaveClass('base-bottom-nav--ghost')
		await expect(canvas.getByRole('navigation', { name: 'notched' }).querySelector('.base-bottom-nav__link--primary')).not.toBeNull()
		await expect(canvas.getByRole('navigation', { name: 'floating' }).querySelector('.base-bottom-nav__link--primary')).toBeNull()
	},
}
