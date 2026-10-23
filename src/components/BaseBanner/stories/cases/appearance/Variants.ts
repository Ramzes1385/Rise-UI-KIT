import { MESSAGES } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseBanner.stories'
import BaseBanner from '../../../ui/BaseBanner.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { BANNER_VARIANTS } from '../../../types/BaseBanner.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = BANNER_VARIANTS

const template = `
	<div class="story-stack">
		<BaseBanner v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="'Объявление ' + variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	args: { type: 'info', text: MESSAGES.info },
	parameters: {
		controls: { include: ['type', 'sizeScale', 'isClosable'] },
		docs: {
			description: {
				story: 'Три варианта для одного типа (тип меняется в Controls): заливка роли, мягкий фон, светлая полоса с рамкой роли.',
			},
			source: storySource({ template, imports: ['BaseBanner'], script: `const variants = ${literal(variants)}` }),
		},
	},
	render: args => ({
		components: { BaseBanner },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('region')).toHaveLength(3)
	},
}
