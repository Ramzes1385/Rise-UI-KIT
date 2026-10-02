import { NEWS } from '../../shared'
import type meta from '../../BaseMarquee.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMarquee from '../../../ui/BaseMarquee.vue'
import { MARQUEE_VARIANTS } from '../../../types/BaseMarquee.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-col">
		<BaseMarquee v-for="variant in MARQUEE_VARIANTS" :key="variant" v-bind="args" :variant="variant" :items="news">
			<template #separator>•</template>
		</BaseMarquee>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: `default` — без фона и рамки, `soft` — мягкий фон, `outline` — рамка.' },
			source: storySource({ template, imports: ['BaseMarquee', 'MARQUEE_VARIANTS'], script: `const news = ${literal(NEWS)}` }),
		},
		controls: { include: ['sizeScale', 'speed', 'hasFade'] },
	},
	render: args => ({
		components: { BaseMarquee },
		setup: useStorySetup(args, { data: { MARQUEE_VARIANTS, news: NEWS } }),
		template,
	}),
}
