import { NEWS } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseMarquee.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMarquee from '../../../ui/BaseMarquee.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseMarquee v-bind="args" :items="news" label="Новости">
		<template #separator>•</template>
	</BaseMarquee>
`

export const News: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Новости из `items` с разделителем — слот `separator` (скрыт от скринридера). Скринридер читает ленту списком один раз: копии для бесшовного круга скрыты.',
			},
			source: storySource({ template, imports: ['BaseMarquee'], script: `const news = ${literal(NEWS)}` }),
		},
	},
	render: args => ({
		components: { BaseMarquee },
		setup: useStorySetup(args, { data: { news: NEWS } }),
		template,
	}),
	play: async ({ canvas }) => {
		const marquee = canvas.getByRole('marquee', { name: 'Новости' })
		const list = canvas.getByRole('list')
		await expect(marquee).toContainElement(list)
		await expect(canvas.getAllByRole('listitem')).toHaveLength(NEWS.length)
	},
}
