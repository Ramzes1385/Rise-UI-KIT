import { SMALL_COLUMNS } from '../../shared'
import type meta from '../../BaseKanban.stories'
import BaseKanban from '../../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { KANBAN_VARIANTS } from '../../../types/BaseKanban.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = KANBAN_VARIANTS

const template = `
	<div style="display: grid; gap: 24px">
		<BaseKanban v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :aria-label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления на двух колонках. Размер из Controls применяется ко всем.' },
			source: storySource({
				template,
				imports: ['BaseKanban'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant'],
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	args: { columns: SMALL_COLUMNS },
	render: args => ({
		components: { BaseKanban },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
