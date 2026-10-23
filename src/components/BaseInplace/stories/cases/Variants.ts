import type meta from '../BaseInplace.stories'
import BaseInplace from '../../ui/BaseInplace.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { INPLACE_VARIANTS } from '../../types/BaseInplace.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = INPLACE_VARIANTS

const template = `
	<div class="story-stack"><div v-for="variant in variants" :key="variant" class="story-row"><span class="story-label" style="width: 64px;">{{ variant }}</span><BaseInplace v-bind="args" :variant="variant" /></div></div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: `default` — пунктирное подчёркивание, `ghost` — без него.' },
			source: storySource({ template, imports: ['BaseInplace'], script: `const variants = ${literal(variants)}`, omit: ['variant'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseInplace },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant'] }),
		template,
	}),
}
