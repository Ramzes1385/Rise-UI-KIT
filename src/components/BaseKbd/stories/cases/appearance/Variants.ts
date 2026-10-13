import BaseKbd from '../../../ui/BaseKbd.vue'
import type meta from '../../BaseKbd.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { KBD_VARIANTS } from '../../../types/BaseKbd.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = KBD_VARIANTS

const template = `
	<div class="story-row"><BaseKbd v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" /></div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: `default` — клавиша с гранью, `outline` — рамка, `soft` — фон, `ghost` — текст.' },
			source: storySource({ template, imports: ['BaseKbd'], script: `const variants = ${literal(variants)}`, omit: ['variant'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseKbd },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant'] }),
		template,
	}),
}
