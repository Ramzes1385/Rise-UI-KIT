import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { BADGE_STATUSES } from '../../../types/BaseBadge.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const statuses = [...BADGE_STATUSES]
const variants = ['default', 'soft', 'outline', 'ghost'] as const

const template = `
	<div class="story-stack">
		<div v-for="variant in variants" :key="variant" class="story-row">
			<BaseBadge v-for="status in statuses" :key="status" v-bind="args" :variant="variant" :status="status" :label="status" />
		</div>
	</div>
`

export const Palette: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Палитра `status`: `primary` (по умолчанию), `neutral`, `info`, `success`, `warning`, `error` — токены ролей темы',
					'(`--rise-<роль>`, `-soft`, `-text`). Работает с вариантами `default`, `soft`, `outline`, `ghost`; `color` перекрывает палитру.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBadge'],
				script: `const statuses = ${literal(statuses)}\nconst variants = ${literal(variants)}`,
				omit: ['default', 'label', 'variant', 'status'],
			}),
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: useStorySetup(args, { data: { statuses, variants }, slots: ['default', 'label', 'variant', 'status'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const badges = canvas.getAllByText('info')
		await expect(badges).toHaveLength(variants.length)
		await expect(badges[0].closest('.base-badge')).toHaveClass('base-badge--status-info')
	},
}
