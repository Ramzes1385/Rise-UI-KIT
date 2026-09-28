import { ref } from 'vue'
import { MODEL_KEYS } from '../shared'
import type meta from '../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BasePagination from '../../ui/BasePagination.vue'
import { PAGINATION_VARIANTS } from '../../types/BasePagination.types'

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
			source: {
				code: PAGINATION_VARIANTS.map(variant => `<BasePagination v-model="page" :total="120" variant="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BasePagination },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, 'variant']),
			variants: PAGINATION_VARIANTS,
			pages: ref<Record<string, number>>(Object.fromEntries(PAGINATION_VARIANTS.map(variant => [variant, 5]))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BasePagination v-bind="props" v-model="pages[variant]" :variant="variant" />
				</div>
			</div>
		`,
	}),
}
