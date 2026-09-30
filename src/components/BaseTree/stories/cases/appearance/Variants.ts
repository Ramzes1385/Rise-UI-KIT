import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { TREE_VARIANTS } from '../../../types/BaseTree.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const hidden = ['variant', 'expandedIds', 'selectedIds']

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<div v-for="variant in TREE_VARIANTS" :key="variant" class="story-stack" style="gap: 8px;">
			<span class="story-label">{{ variant }}</span>
			<BaseTree v-bind="args" :variant="variant" :expanded-ids="['src', 'components']" :selected-ids="['user-card']" selection-mode="single" />
		</div>
	</div>
`

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
			source: storySource({ template, imports: ['BaseTree', 'TREE_VARIANTS'], omit: hidden }),
		},
	},
	render: args => ({
		components: { BaseTree },
		setup: useStorySetup(args, { data: { TREE_VARIANTS }, slots: hidden }),
		template,
	}),
}
