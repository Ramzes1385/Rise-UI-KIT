import type meta from '../BaseAlert.stories'
import BaseAlert from '../../ui/BaseAlert.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['type', 'sizeScale', 'isClosable'] },
		docs: {
			description: {
				story: 'Пять вариантов для одного типа (тип меняется в Controls): заливка, мягкий фон, рамка, только текст, карточка с тенью.',
			},
			source: {
				code: ['default', 'soft', 'outline', 'ghost', 'shadow']
					.map(variant => `<BaseAlert variant="${variant}" title="${variant}" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ['default', 'soft', 'outline', 'ghost', 'shadow'] }),
		template: `
			<div class="story-stack story-medium">
				<BaseAlert v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :title="variant" />
			</div>
		`,
	}),
}
