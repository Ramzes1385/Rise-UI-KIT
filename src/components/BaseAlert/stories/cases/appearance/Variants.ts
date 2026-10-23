import type meta from '../../BaseAlert.stories'
import BaseAlert from '../../../ui/BaseAlert.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = ['default', 'soft', 'outline', 'ghost', 'shadow']

const template = `
	<div class="story-stack story-medium">
		<BaseAlert v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :title="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['type', 'sizeScale', 'isClosable'] },
		docs: {
			description: {
				story: 'Пять вариантов для одного типа (тип меняется в Controls): заливка, мягкий фон, рамка, только текст, карточка с тенью.',
			},
			source: storySource({ template, imports: ['BaseAlert'], script: `const variants = ${literal(variants)}` }),
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
