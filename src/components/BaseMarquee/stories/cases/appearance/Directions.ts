import { NEWS } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseMarquee.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMarquee from '../../../ui/BaseMarquee.vue'
import { MARQUEE_DIRECTIONS } from '../../../types/BaseMarquee.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-grid">
		<BaseMarquee
			v-for="direction in MARQUEE_DIRECTIONS"
			:key="direction"
			v-bind="args"
			:direction="direction"
			:label="direction"
			:items="news">
			<template #separator>•</template>
		</BaseMarquee>
	</div>
`

export const Directions: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Направления: `left` и `right` — по горизонтали, `up` и `down` — по вертикали (высота области — 160 px при `sizeScale` 100, своя — через `customClass.viewport`).',
			},
			source: storySource({ template, imports: ['BaseMarquee', 'MARQUEE_DIRECTIONS'], script: `const news = ${literal(NEWS)}` }),
		},
		controls: { include: ['speed', 'gap', 'hasFade', 'variant'] },
	},
	args: { variant: 'outline' },
	render: args => ({
		components: { BaseMarquee },
		setup: useStorySetup(args, { data: { MARQUEE_DIRECTIONS, news: NEWS } }),
		template,
	}),
	play: async ({ canvas }) => {
		for (const direction of MARQUEE_DIRECTIONS)
			await expect(canvas.getByRole('marquee', { name: direction })).toHaveClass(`base-marquee--${direction}`)
	},
}
