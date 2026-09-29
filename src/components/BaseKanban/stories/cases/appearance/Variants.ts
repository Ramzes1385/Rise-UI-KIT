import { SMALL_COLUMNS } from '../../shared'
import type meta from '../../BaseKanban.stories'
import BaseKanban from '../../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { KANBAN_VARIANTS } from '../../../types/BaseKanban.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Все варианты оформления на двух колонках. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	args: { columns: SMALL_COLUMNS },
	render: args => ({
		components: { BaseKanban },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: KANBAN_VARIANTS }),
		template:
			'<div style="display: grid; gap: 24px"><BaseKanban v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :aria-label="variant" /></div>',
	}),
}
