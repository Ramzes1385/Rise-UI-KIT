import type meta from '../BaseButton.stories'
import BaseButton from '../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Пять вариантов оформления. Остальные props из Controls (размер, состояния) применяются ко всем кнопкам.',
			},
			source: {
				code: [
					'<BaseButton>default</BaseButton>',
					'<BaseButton variant="soft">soft</BaseButton>',
					'<BaseButton variant="outline">outline</BaseButton>',
					'<BaseButton variant="ghost">ghost</BaseButton>',
					'<BaseButton variant="shadow">shadow</BaseButton>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ['default', 'soft', 'outline', 'ghost', 'shadow'] }),
		template: `
			<div class="story-row">
				<BaseButton v-for="variant in variants" :key="variant" v-bind="props" :variant="variant">{{ variant }}</BaseButton>
			</div>
		`,
	}),
}
