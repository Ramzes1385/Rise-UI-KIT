import BaseKbd from '../../ui/BaseKbd.vue'
import type meta from '../BaseKbd.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { KBD_VARIANTS } from '../../types/BaseKbd.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты: `default` — клавиша с гранью, `outline` — рамка, `soft` — фон, `ghost` — текст.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseKbd },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: KBD_VARIANTS }),
		template: '<div class="story-row"><BaseKbd v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" /></div>',
	}),
}
