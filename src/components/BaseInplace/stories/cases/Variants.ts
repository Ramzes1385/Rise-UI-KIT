import type meta from '../BaseInplace.stories'
import BaseInplace from '../../ui/BaseInplace.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { INPLACE_VARIANTS } from '../../types/BaseInplace.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты: `default` — пунктирное подчёркивание, `ghost` — без него.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseInplace },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: INPLACE_VARIANTS }),
		template:
			'<div class="story-stack"><div v-for="variant in variants" :key="variant" class="story-row"><span class="story-label" style="width: 64px;">{{ variant }}</span><BaseInplace v-bind="props" :variant="variant" /></div></div>',
	}),
}
