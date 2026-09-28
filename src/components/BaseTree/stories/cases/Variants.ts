import type meta from '../BaseTree.stories'
import BaseTree from '../../ui/BaseTree.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { TREE_VARIANTS } from '../../types/BaseTree.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'selectionMode', 'arrowPosition'] },
		docs: {
			description: {
				story: [
					'Пять вариантов: `default` — без контейнера, `ghost` — ещё и без внутреннего отступа (дерево в боковой панели),',
					'`outline` — рамка, `shadow` — рамка и тень, `soft` — мягкий фон. Строки узлов одинаковые во всех вариантах.',
				].join('\n'),
			},
			source: { code: TREE_VARIANTS.map(variant => `<BaseTree :items="items" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseTree },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'expandedIds', 'selectedIds']), variants: TREE_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<div v-for="variant in variants" :key="variant" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ variant }}</span>
					<BaseTree v-bind="props" :variant="variant" :expanded-ids="['src', 'components']" :selected-ids="['user-card']" selection-mode="single" />
				</div>
			</div>
		`,
	}),
}
