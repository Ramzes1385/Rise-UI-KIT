import { NEWS } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseMarquee.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMarquee from '../../../ui/BaseMarquee.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseMarquee v-bind="args" :items="news" label="Лента новостей" />
	</div>
`

export const Vertical: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Вертикальная лента новостей: `direction="up"` и затухание краёв `has-fade`.' },
			source: storySource({ template, imports: ['BaseMarquee'], script: `const news = ${literal(NEWS)}` }),
		},
		controls: { include: ['direction', 'speed', 'gap', 'hasFade', 'variant'] },
	},
	args: { direction: 'up', hasFade: true, speed: 30, gap: 12, variant: 'soft' },
	render: args => ({
		components: { BaseMarquee },
		setup: useStorySetup(args, { data: { news: NEWS } }),
		template,
	}),
	play: async ({ canvas }) => {
		const marquee = canvas.getByRole('marquee', { name: 'Лента новостей' })
		await expect(marquee).toHaveClass('base-marquee--vertical')
		await expect(canvas.getAllByRole('listitem').length).toBeGreaterThanOrEqual(NEWS.length)
	},
}
