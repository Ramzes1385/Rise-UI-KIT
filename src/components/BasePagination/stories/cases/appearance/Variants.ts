import { MODEL_KEYS } from '../../shared'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePagination from '../../../ui/BasePagination.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { PAGINATION_VARIANTS } from '../../../types/BasePagination.types'

const state = { pages: Object.fromEntries(PAGINATION_VARIANTS.map(variant => [variant, 5])) }

const hidden = [...MODEL_KEYS, 'variant']

const template = `
	<div class="story-stack">
		<div v-for="variant in PAGINATION_VARIANTS" :key="variant" class="story-col">
			<span class="story-label">{{ variant }}</span>
			<BasePagination v-bind="args" v-model="pages[variant]" :variant="variant" :aria-label="'Пагинация ' + variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'total', 'pageSize'] },
		docs: {
			description: {
				story: [
					'Варианты задают вид стрелок и неактивных страниц: `default` — ghost, остальные — одноимённый вариант BaseButton.',
					'Текущая страница всегда залита основным цветом.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BasePagination', 'PAGINATION_VARIANTS'],
				state,
				types: { pages: 'Record<string, number>' },
				omit: hidden,
			}),
		},
	},
	render: args => ({
		components: { BasePagination },
		setup: useStorySetup(args, { state, data: { PAGINATION_VARIANTS }, slots: hidden }),
		template,
	}),
}
