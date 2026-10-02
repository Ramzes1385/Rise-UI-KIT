import { LOGOS } from '../../shared'
import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseMarquee.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMarquee from '../../../ui/BaseMarquee.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseMarquee v-bind="args" :items="logos" label="Наши партнёры">
		<template #item="{ item }">
			<BaseIcon :name="item.icon" />
			<strong>{{ item.name }}</strong>
		</template>
	</BaseMarquee>
`

export const Logos: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Логотипы партнёров: свой вид элемента — слот `item` (`{ item, index }`), затухание краёв `has-fade`, отступ `gap` больше.',
			},
			source: storySource({ template, imports: ['BaseMarquee', 'BaseIcon'], script: `const logos = ${literal(LOGOS)}` }),
		},
	},
	args: { hasFade: true, gap: 48, speed: 40 },
	render: args => ({
		components: { BaseMarquee, BaseIcon },
		setup: useStorySetup(args, { data: { logos: LOGOS } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('marquee', { name: 'Наши партнёры' })).toHaveClass('base-marquee--fade')
		await expect(canvas.getAllByRole('listitem')).toHaveLength(LOGOS.length)
	},
}
