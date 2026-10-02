import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseMarquee.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMarquee from '../../../ui/BaseMarquee.vue'
import { NEWS, emulateReducedMotion } from '../../shared'
import { literal, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseMarquee v-bind="args" :items="news" label="Новости">
			<template #separator>•</template>
		</BaseMarquee>
	</div>
`

export const ReducedMotion: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'При `prefers-reduced-motion: reduce` лента не движется, не копируется и не показывает кнопку паузы; длинная лента прокручивается — с клавиатуры тоже (область получает фокус стрелками). История включает эту настройку сама.',
			},
			source: storySource({ template, imports: ['BaseMarquee'], script: `const news = ${literal(NEWS)}` }),
		},
	},
	tags: ['!autodocs'],
	beforeEach: emulateReducedMotion(true),
	render: args => ({
		components: { BaseMarquee },
		setup: useStorySetup(args, { data: { news: NEWS } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const marquee = canvas.getByRole('marquee', { name: 'Новости' })
		await expect(marquee).toHaveClass('base-marquee--static')
		await expect(canvasElement.querySelectorAll('.base-marquee__group')).toHaveLength(1)
		await expect(canvas.queryByRole('button')).toBeNull()
		const viewport = canvasElement.querySelector('.base-marquee__viewport') as HTMLElement
		await waitFor(() => expect(viewport).toHaveAttribute('tabindex', '0'))
		await tabTo(viewport, userEvent)
		await expect(viewport).toHaveFocus()
		await expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth)
	},
}
